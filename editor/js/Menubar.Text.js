import { UIPanel, UIRow } from './libs/ui.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';
import { ExtrudeMeshFromFont } from './libs/ExtrudeMeshFromFont.js';
import { TextParametersDialog } from './TextParametersDialog.js';

// Opens TextParametersDialog (font picked/uploaded via WP's own media library) and
// extrudes the result into a 3D text mesh - mirrors Menubar.Svg.js's add-to-scene flow.
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

	const option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/3dtext/add' ) );
	option.onClick( async () => {

		let result;
		try {
			result = await new TextParametersDialog( editor ).show();
		} catch ( e ) {
			return; // dialog cancelled
		}

		const textMesh = ExtrudeMeshFromFont( result.font, result.text, result );
		textMesh.name = `${result.text} (3D Text)`;

		editor.execute( new AddObjectAndSetMetaCommand( editor, textMesh, {
			position: { x: 0, y: 0, z: 0 },
			scale: { x: 1, y: 1, z: 1 },
			rotation: { x: 0, y: 0, z: 0 },
			wpData: {
				id: result.fontId,
				source_url: result.fontUrl,
				type: 'text-3d',
				text: result.text,
				size: result.size,
				depth: result.depth,
				bevelEnabled: result.bevelEnabled,
				align: result.align,
				maxWidth: result.maxWidth,
				wordWrap: result.wordWrap,
				letterSpacing: result.letterSpacing,
				lineHeight: result.lineHeight,
				kerning: result.kerning,
			},
		} ) );

	} );
	options.add( option );

	return container;

}

export { MenubarText };
