import { UIPanel, UIButton } from './libs/ui.js';

function MenubarUndoRedo( editor ) {

	const container = new UIPanel();
	container.setClass( 'menu' );

	const undo = new UIButton( '\u21B6' ); // ↶
	undo.dom.className = 'Button';
	undo.dom.title = 'Undo';
	undo.onClick( function () {

		editor.undo();

	} );
	container.add( undo );

	const redo = new UIButton( '\u21B7' ); // ↷
	redo.dom.className = 'Button';
	redo.dom.title = 'Redo';
	redo.onClick( function () {

		editor.redo();

	} );
	container.add( redo );

	function update() {

		undo.setDisabled( editor.history.undos.length === 0 );
		redo.setDisabled( editor.history.redos.length === 0 );

	}

	editor.signals.historyChanged.add( update );
	update();

	return container;

}

export { MenubarUndoRedo };
