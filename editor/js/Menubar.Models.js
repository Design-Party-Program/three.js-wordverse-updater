import { UIPanel } from './libs/ui.js';
import { openAddModelModal } from './AddModelModal.js';

function MenubarModels( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/models' ) );
	title.onClick( () => openAddModelModal( editor ) );
	container.add( title );

	return container;

}

export { MenubarModels };
