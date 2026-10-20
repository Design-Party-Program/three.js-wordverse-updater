import * as THREE from 'three';
import opentype from 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/+esm';

// Builds an extruded 3D text mesh directly from a parsed opentype.js Font - NOT via
// three.js's own TTFLoader/Font/TextGeometry stack, which round-trips through a lossy
// "typeface JSON" format that drops per-glyph kerning pairs and font name/weight
// metadata, both needed here. Mirrors the SAME proven pipeline ExtrudeMeshFromSvg.js
// already uses (path commands -> THREE.ShapePath -> toShapes -> ExtrudeGeometry) -
// just fed from opentype.js glyph outlines instead of SVG path data.

export const parseFontBuffer = ( arrayBuffer ) => opentype.parse( arrayBuffer );

// Best-effort static metadata read directly off the font file - opentype.js has no
// support for applying variable-font (fvar/gvar) axes to glyph outlines, so a single
// uploaded TTF/OTF only ever has ONE baked-in weight/style. "Choosing a variant" means
// picking a DIFFERENT uploaded font file (e.g. "MyFont-Bold.ttf"), not a weight slider -
// this just surfaces what's actually in the file so that choice is informed.
export const getFontInfo = ( font ) => {
	const names = font.names || {};
	const pickName = ( field ) => {
		const rec = names[ field ];
		if ( ! rec ) return '';
		return rec.en || Object.values( rec )[ 0 ] || '';
	};
	const macStyle = ( font.tables.head && font.tables.head.macStyle ) || 0;
	return {
		familyName: pickName( 'fontFamily' ) || pickName( 'preferredFamily' ),
		subfamilyName: pickName( 'fontSubfamily' ) || pickName( 'preferredSubfamily' ),
		weightClass: font.tables.os2 ? font.tables.os2.usWeightClass : undefined,
		isBold: !! ( macStyle & 0b01 ),
		isItalic: !! ( macStyle & 0b10 ),
	};
};

// Lays out `text` into THREE.Shape[] - handles forced ('\n') + wrapped line breaks,
// left/center/right alignment (relative to maxWidth, or the longest line if unset),
// per-pair kerning (opentype.js's own GPOS/kern table reader) and manual letter-spacing
// / line-height. Returns plain Shapes (not yet extruded) so the caller can feed them
// into one ExtrudeGeometry call, exactly like Font.generateShapes()+TextGeometry do.
function layoutShapes( font, text, { size, align, maxWidth, wordWrap, letterSpacing, lineHeight, kerning } ) {

	const scale = size / font.unitsPerEm;

	const advanceOf = ( glyph ) => ( glyph.advanceWidth || 0 ) * scale;
	const kernBetween = ( prevGlyph, glyph ) =>
		( kerning && prevGlyph ) ? font.getKerningValue( prevGlyph, glyph ) * scale : 0;

	function measureLine( line ) {
		let width = 0;
		let prevGlyph = null;
		for ( const ch of line ) {
			const glyph = font.charToGlyph( ch );
			width += kernBetween( prevGlyph, glyph ) + advanceOf( glyph ) + letterSpacing;
			prevGlyph = glyph;
		}
		return line.length ? width - letterSpacing : 0;
	}

	function wrapParagraph( paragraph ) {
		if ( ! maxWidth || maxWidth <= 0 ) return [ paragraph ];
		const lines = [];
		if ( wordWrap ) {
			const words = paragraph.split( ' ' );
			let current = '';
			words.forEach( ( word ) => {
				const trial = current ? current + ' ' + word : word;
				if ( current && measureLine( trial ) > maxWidth ) {
					lines.push( current );
					current = word;
				} else {
					current = trial;
				}
			} );
			lines.push( current );
		} else {
			// No word-wrap: hard-break at whatever character crosses maxWidth.
			let current = '';
			for ( const ch of paragraph ) {
				const trial = current + ch;
				if ( current && measureLine( trial ) > maxWidth ) {
					lines.push( current );
					current = ch;
				} else {
					current = trial;
				}
			}
			lines.push( current );
		}
		return lines;
	}

	const lines = text.split( '\n' ).flatMap( wrapParagraph );
	const lineWidths = lines.map( measureLine );
	const blockWidth = maxWidth > 0 ? maxWidth : Math.max( 0, ...lineWidths );
	const lineHeightPx = ( font.ascender - font.descender ) * scale * lineHeight;
	const alignFactor = align === 'center' ? 0.5 : align === 'right' ? 1 : 0;

	const shapes = [];
	lines.forEach( ( line, lineIndex ) => {
		let x = ( blockWidth - lineWidths[ lineIndex ] ) * alignFactor;
		const y = - lineIndex * lineHeightPx;
		let prevGlyph = null;
		for ( const ch of line ) {
			const glyph = font.charToGlyph( ch );
			x += kernBetween( prevGlyph, glyph );
			if ( ch !== ' ' && glyph.path && glyph.path.commands.length ) {
				const path = glyph.getPath( x, y, size );
				const shapePath = new THREE.ShapePath();
				path.commands.forEach( ( cmd ) => {
					switch ( cmd.type ) {
						case 'M': shapePath.moveTo( cmd.x, cmd.y ); break;
						case 'L': shapePath.lineTo( cmd.x, cmd.y ); break;
						case 'Q': shapePath.quadraticCurveTo( cmd.x1, cmd.y1, cmd.x, cmd.y ); break;
						case 'C': shapePath.bezierCurveTo( cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y ); break;
						case 'Z': shapePath.currentPath.autoClose = true; break;
					}
				} );
				shapes.push( ...shapePath.toShapes( false ) );
			}
			x += advanceOf( glyph ) + letterSpacing;
			prevGlyph = glyph;
		}
	} );

	return shapes;
}

export const ExtrudeMeshFromFont = ( font, text, {
	size = 1,
	depth = 0.2,
	bevelEnabled = false,
	align = 'left',
	maxWidth = 0,
	wordWrap = true,
	letterSpacing = 0,
	lineHeight = 1.2,
	kerning = true,
	color = 0x222222,
} = {} ) => {

	const shapes = layoutShapes( font, text || '', {
		size, align, maxWidth, wordWrap, letterSpacing, lineHeight, kerning,
	} );

	const geometry = shapes.length
		? new THREE.ExtrudeGeometry( shapes, {
			depth,
			bevelEnabled,
			bevelThickness: 0.02,
			bevelSize: 0.01,
			curveSegments: 6,
		} )
		: new THREE.BufferGeometry();

	geometry.computeBoundingBox();
	geometry.center();

	const material = new THREE.MeshBasicMaterial( { color, side: THREE.DoubleSide } );
	const mesh = new THREE.Mesh( geometry, material );

	const returnGroup = new THREE.Group();
	returnGroup.add( mesh );
	return returnGroup;
};
