import { UIPanel, UIButton } from './libs/ui.js';

function MenubarUndoRedo( editor ) {

	const container = new UIPanel();
	container.setClass( 'menu' );

	const undo = new UIButton( '\u21B6' ); // ↶
	undo.dom.className = 'Button';
	undo.dom.title = 'Undo';
	undo.onClick( function () {

		const cmd = editor.history.undos[ editor.history.undos.length - 1 ];
		editor.undo();
		if ( cmd ) broadcastCommandSync( cmd );

	} );
	container.add( undo );

	const redo = new UIButton( '\u21B7' ); // ↷
	redo.dom.className = 'Button';
	redo.dom.title = 'Redo';
	redo.onClick( function () {

		const cmd = editor.history.redos[ editor.history.redos.length - 1 ];
		editor.redo();
		if ( cmd ) broadcastCommandSync( cmd );

	} );
	container.add( redo );

	function update() {

		undo.setDisabled( editor.history.undos.length === 0 );
		redo.setDisabled( editor.history.redos.length === 0 );

	}

	editor.signals.historyChanged.add( update );
	update();

	/**
	 * Re-broadcasts the net effect of an undo/redo over MQTT, by reading the
	 * object's state AFTER the command ran (same either way, so direction
	 * doesn't matter here) and sending the same message type the live editing
	 * action would have sent. Only command types that already have a
	 * corresponding live-sync message can be mirrored this way; MoveObjectCommand
	 * (Ctrl+G grouping) has no forward sync yet, so its undo/redo isn't
	 * broadcast either — see Sidebar.Settings.Shortcuts.js.
	 */
	function broadcastCommandSync( cmd ) {

		if ( cmd.type === 'MultiCmdsCommand' ) {

			cmd.cmdArray.forEach( broadcastCommandSync );
			return;

		}

		const object = cmd.object;
		if ( ! object ) return;

		switch ( cmd.type ) {

			case 'SetPositionCommand':
				editor.sendMqtt( 'setObjectPosition', { objectName: object.name, uuid: object.uuid, newPosition: object.position } );
				break;

			case 'SetRotationCommand':
				editor.sendMqtt( 'setObjectRotation', { objectName: object.name, uuid: object.uuid, newRotation: object.rotation } );
				break;

			case 'SetScaleCommand':
				editor.sendMqtt( 'setObjectScale', { objectName: object.name, uuid: object.uuid, newScale: object.scale } );
				break;

			case 'RemoveObjectCommand':
			case 'AddObjectCommand':

				if ( object.parent === null ) {

					// object is gone (redo of a delete, or undo of an add) — same message the delete shortcut sends
					editor.sendMqtt( 'removeObject', { uuid: object.uuid } );

				} else {

					// object is back (undo of a delete, or redo of an add) — remote clients
					// didn't keep a copy, so send it fully serialized for reconstruction
					editor.sendMqtt( 'reAddObject', {
						uuid: object.uuid,
						parentUuid: object.parent.uuid,
						index: object.parent.children.indexOf( object ),
						objectJSON: object.toJSON(),
					} );

				}

				break;

		}

	}

	return container;

}

export { MenubarUndoRedo };
