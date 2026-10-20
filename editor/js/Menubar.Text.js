import { UIPanel, UIRow } from './libs/ui.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';
import { ExtrudeMeshFromFont } from './libs/ExtrudeMeshFromFont.js';
import { TextParametersDialog } from './TextParametersDialog.js';

// Mirrors Menubar.Svg.js: lists WP media filtered to font files, prompts for
// the text string/size/depth, then extrudes it into a 3D text mesh.
function MenubarText( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/3dtext' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	const addFontOption = ( fontMedia ) => {

		const option = new UIRow();
		option.setClass( 'option' );
		option.setTextContent( decodeURI( fontMedia.title.rendered ) );
		option.onClick( async () => {

			let params;
			try {
				params = await new TextParametersDialog( editor ).show();
			} catch ( e ) {
				return; // dialog cancelled
			}

			fetch( '/wp-json/wp/v2/media/' + fontMedia.id )
				.then( fontResult => fontResult.json() )
				.then( fontData => {
					fetch( '' + fontData.source_url )
						.then( fontFile => fontFile.arrayBuffer() )
						.then( fontBuffer => {

							const textMesh = ExtrudeMeshFromFont( fontBuffer, params.text, params );
							textMesh.name = `${params.text} (3D Text)`;

							editor.execute( new AddObjectAndSetMetaCommand( editor, textMesh, {
								position: { x: 0, y: 0, z: 0 },
								scale: { x: 1, y: 1, z: 1 },
								rotation: { x: 0, y: 0, z: 0 },
								wpData: {
									...fontData,
									type: 'text-3d',
									text: params.text,
									size: params.size,
									depth: params.depth,
									bevelEnabled: params.bevelEnabled,
								},
							} ) );

						} );
				} );

		} );
		options.add( option );

	};

	// WP media search doesn't filter by mime type, so merge the .ttf and .otf searches.
	Promise.all( [
		fetch( '/wp-json/wp/v2/media?per_page=100&search=.ttf' ).then( r => r.json() ),
		fetch( '/wp-json/wp/v2/media?per_page=100&search=.otf' ).then( r => r.json() ),
	] ).then( ( [ ttfResults, otfResults ] ) => {
		[ ...ttfResults, ...otfResults ].forEach( addFontOption );
	} );

	return container;

}

export { MenubarText };
