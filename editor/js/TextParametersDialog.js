import { UIButton, UICheckbox, UIDiv, UINumber, UIRow, UISelect, UIText, UITextArea } from './libs/ui.js';
import { parseFontBuffer, getFontInfo } from './libs/ExtrudeMeshFromFont.js';

// WP media mime types covering the various ways a server/browser may report TTF/OTF
// files - passed to wp.media's library.type filter. WP's Backbone media query maps
// this straight to post_mime_type, so specific strings work fine even though WP core
// has no built-in "font" media_type bucket (unlike image/video/audio).
const FONT_MIME_TYPES = [
	'font/ttf', 'font/otf', 'font/sfnt',
	'application/x-font-ttf', 'application/x-font-otf',
	'application/font-sfnt', 'application/vnd.ms-opentype',
];

// Modal prompting for a font (via WP's native media picker/uploader) + the text
// string + full layout/extrude parameters, mirroring TextureParametersDialog.js's
// show()/confirm()/cancel() Promise-based pattern. `defaults` pre-fills every field
// (used by Sidebar.Object.js's "Edit..." button to reopen this dialog for an existing
// text-3d object) - when it already carries a font, that font is loaded immediately
// instead of requiring the user to re-pick it.
class TextParametersDialog {

	constructor( editor, defaults = {}, title = 'Add 3D Text' ) {

		this.strings = editor.strings;
		this.font = null; // parsed opentype.js Font, once a font is chosen/loaded
		this.fontId = defaults.fontId || null;
		this.fontUrl = defaults.fontUrl || null;
		this.fontName = defaults.fontName || '';

		const dom = new UIDiv();
		dom.setClass( 'Dialog' );
		this.dom = dom.dom;

		const background = new UIDiv();
		background.setClass( 'Dialog-background' );
		background.dom.addEventListener( 'click', () => this.cancel() );
		dom.add( background );

		const content = new UIDiv();
		content.setClass( 'Dialog-content TextParametersDialog-content' );
		dom.add( content );

		const titleBar = new UIDiv();
		titleBar.setClass( 'Dialog-title' );
		titleBar.setTextContent( title );
		content.add( titleBar );

		const body = new UIDiv();
		body.setClass( 'Dialog-body' );
		content.add( body );

		// ── Font (pick or upload via WP's own media library) ────────────────────
		const fontRow = new UIRow();
		this.fontPickButton = new UIButton( 'Choose Font...' ).setMarginRight( '4px' );
		this.fontLabel = new UIText( this.fontName || '(no font selected)' ).setFontSize( '11px' ).setColor( '#aaa' );
		fontRow.add( new UIText( 'Font' ).setClass( 'Label' ) );
		fontRow.add( this.fontPickButton );
		fontRow.add( this.fontLabel );
		body.add( fontRow );

		this.fontInfoText = new UIText( '' ).setFontSize( '11px' ).setColor( '#888' );
		const fontInfoRow = new UIRow();
		fontInfoRow.dom.style.cssText = 'padding-left:94px;';
		fontInfoRow.add( this.fontInfoText );
		body.add( fontInfoRow );

		this.fontPickButton.onClick( () => this._pickFont() );

		if ( this.fontId && this.fontUrl ) this._loadFont( this.fontUrl, this.fontName );

		// ── Text + layout parameters ─────────────────────────────────────────────
		this.text = new UITextArea().setWidth( '220px' ).setHeight( '60px' );
		this.text.setValue( defaults.text !== undefined ? defaults.text : 'Hello' );
		body.add( createRow( 'Text', this.text ) );

		this.size = new UINumber( defaults.size !== undefined ? defaults.size : 1 ).setRange( 0.01, 1000 ).setWidth( '80px' );
		body.add( createRow( 'Size', this.size ) );

		this.depth = new UINumber( defaults.depth !== undefined ? defaults.depth : 0.2 ).setRange( 0, 1000 ).setWidth( '80px' );
		body.add( createRow( 'Depth', this.depth ) );

		this.bevelEnabled = new UICheckbox( !! defaults.bevelEnabled );
		body.add( createRow( 'Bevel', this.bevelEnabled ) );

		this.align = new UISelect().setOptions( { left: 'Left', center: 'Center', right: 'Right' } ).setValue( defaults.align || 'left' );
		body.add( createRow( 'Align', this.align ) );

		this.maxWidth = new UINumber( defaults.maxWidth !== undefined ? defaults.maxWidth : 0 ).setRange( 0, 100000 ).setWidth( '80px' );
		body.add( createRow( 'Max Width (0 = off)', this.maxWidth ) );

		this.wordWrap = new UICheckbox( defaults.wordWrap !== undefined ? defaults.wordWrap : true );
		body.add( createRow( 'Word Wrap', this.wordWrap ) );

		this.letterSpacing = new UINumber( defaults.letterSpacing !== undefined ? defaults.letterSpacing : 0 ).setRange( -1000, 1000 ).setWidth( '80px' );
		body.add( createRow( 'Letter Spacing', this.letterSpacing ) );

		this.lineHeight = new UINumber( defaults.lineHeight !== undefined ? defaults.lineHeight : 1.2 ).setRange( 0, 10 ).setPrecision( 2 ).setWidth( '80px' );
		body.add( createRow( 'Line Height', this.lineHeight ) );

		this.kerning = new UICheckbox( defaults.kerning !== undefined ? defaults.kerning : true );
		body.add( createRow( 'Kerning', this.kerning ) );

		const buttonsRow = new UIDiv();
		buttonsRow.setClass( 'Dialog-buttons' );
		body.add( buttonsRow );

		const okButton = new UIButton( this.strings.getKey( 'dialog/ok' ) );
		okButton.setWidth( '80px' );
		okButton.onClick( () => this.confirm() );
		buttonsRow.add( okButton );

		const cancelButton = new UIButton( this.strings.getKey( 'dialog/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.cancel() );
		buttonsRow.add( cancelButton );

		this.resolve = null;
		this.reject = null;

	}

	_pickFont() {

		try {

			const frame = parent.wp.media( {
				title: 'Select Font',
				button: { text: 'Use this font' },
				multiple: false,
				library: { type: FONT_MIME_TYPES },
			} );
			frame.on( 'select', () => {

				const att = frame.state().get( 'selection' ).first().toJSON();
				this.fontId = att.id;
				this.fontUrl = att.url;
				this._loadFont( att.url, att.filename || att.title || '' );

			} );
			frame.open();

		} catch ( e ) {

			console.warn( 'WP media picker unavailable:', e );

		}

	}

	_loadFont( url, name ) {

		this.fontName = name || url.split( '/' ).pop();
		this.fontLabel.setValue( this.fontName );
		this.fontInfoText.setValue( 'Loading font metadata...' );

		fetch( url )
			.then( ( r ) => r.arrayBuffer() )
			.then( ( buffer ) => {

				this.font = parseFontBuffer( buffer );
				const info = getFontInfo( this.font );
				const weight = info.weightClass ? ` (weight ${info.weightClass})` : '';
				const style = [ info.isBold ? 'Bold' : '', info.isItalic ? 'Italic' : '' ].filter( Boolean ).join( ' ' );
				this.fontInfoText.setValue(
					`${info.familyName || 'Unknown family'} - ${info.subfamilyName || style || 'Regular'}${weight}`
				);

			} )
			.catch( ( err ) => {

				console.error( 'Failed to parse font', err );
				this.fontInfoText.setValue( 'Could not read font metadata.' );

			} );

	}

	show() {

		document.body.appendChild( this.dom );

		return new Promise( ( resolve, reject ) => {

			this.resolve = resolve;
			this.reject = reject;

		} );

	}

	confirm() {

		if ( ! this.fontId || ! this.font ) {

			alert( 'Please choose a font first.' );
			return;

		}

		const result = {
			fontId: this.fontId,
			fontUrl: this.fontUrl,
			fontName: this.fontName,
			font: this.font,
			text: this.text.getValue() || 'Hello',
			size: this.size.getValue(),
			depth: this.depth.getValue(),
			bevelEnabled: this.bevelEnabled.getValue(),
			align: this.align.getValue(),
			maxWidth: this.maxWidth.getValue(),
			wordWrap: this.wordWrap.getValue(),
			letterSpacing: this.letterSpacing.getValue(),
			lineHeight: this.lineHeight.getValue(),
			kerning: this.kerning.getValue(),
		};

		this.dom.remove();

		if ( this.resolve ) this.resolve( result );

	}

	cancel() {

		this.dom.remove();

		if ( this.reject ) this.reject( new Error( '3D text parameters cancelled' ) );

	}

}

function createRow( label, ...inputs ) {

	const row = new UIRow();
	row.add( new UIText( label ).setClass( 'Label' ) );

	for ( const input of inputs ) {

		row.add( input );

	}

	return row;

}

export { TextParametersDialog };

