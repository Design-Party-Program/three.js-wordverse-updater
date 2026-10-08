import { UIPanel, UIText, UIRow, UIInput } from './libs/ui.js';
import * as THREE from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

import { MultiCmdsCommand } from './commands/MultiCmdsCommand.js';
import { RemoveObjectCommand } from './commands/RemoveObjectCommand.js';
import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { MoveObjectCommand } from './commands/MoveObjectCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';

function SidebarSettingsShortcuts( editor ) {

	const strings = editor.strings;

	const IS_MAC = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;

	function isValidKeyBinding( key ) {

		return key.match( /^[A-Za-z0-9]$/i ); // Can't use z currently due to undo/redo

	}

	const config = editor.config;
	const signals = editor.signals;

	let clipboard = [];

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add( new UIText( strings.getKey( 'sidebar/settings/shortcuts' ).toUpperCase() ) );
	container.add( headerRow );

	const shortcuts = [ 'translate', 'rotate', 'scale', /* 'undo', */ 'focus', 'perspective', 'orthographic', 'selectAll' ];

	function createShortcutInput( name ) {

		const configName = 'settings/shortcuts/' + name;
		const shortcutRow = new UIRow();

		const shortcutInput = new UIInput().setWidth( '15px' ).setFontSize( '12px' );
		shortcutInput.setTextAlign( 'center' );
		shortcutInput.setTextTransform( 'lowercase' );
		shortcutInput.onChange( function () {

			const value = shortcutInput.getValue().toLowerCase();

			if ( isValidKeyBinding( value ) ) {

				config.setKey( configName, value );

			}

		} );

		// Automatically highlight when selecting an input field
		shortcutInput.dom.addEventListener( 'click', function () {

			shortcutInput.dom.select();

		} );

		// If the value of the input field is invalid, revert the input field
		// to contain the key binding stored in config
		shortcutInput.dom.addEventListener( 'blur', function () {

			if ( ! isValidKeyBinding( shortcutInput.getValue() ) ) {

				shortcutInput.setValue( config.getKey( configName ) );

			}

		} );

		// If a valid key binding character is entered, blur the input field
		shortcutInput.dom.addEventListener( 'keyup', function ( event ) {

			if ( isValidKeyBinding( event.key ) ) {

				shortcutInput.dom.blur();

			}

		} );

		if ( config.getKey( configName ) !== undefined ) {

			shortcutInput.setValue( config.getKey( configName ) );

		}

		shortcutInput.dom.maxLength = 1;
		shortcutRow.add( new UIText( strings.getKey( 'sidebar/settings/shortcuts/' + name ) ).setTextTransform( 'capitalize' ).setClass( 'Label' ) );
		shortcutRow.add( shortcutInput );

		container.add( shortcutRow );

	}

	for ( let i = 0; i < shortcuts.length; i ++ ) {

		createShortcutInput( shortcuts[ i ] );

	}

	document.addEventListener( 'keydown', function ( event ) {

		const activeTag = document.activeElement ? document.activeElement.tagName : '';
		const isEditingText = activeTag === 'INPUT' || activeTag === 'TEXTAREA' ||
			( document.activeElement && document.activeElement.isContentEditable );

		if ( ! isEditingText && ( event.ctrlKey || event.metaKey ) ) {

			const key = event.key.toLowerCase();

			if ( key === 'c' ) {

				event.preventDefault();

				clipboard = editor.selector.selection
					.filter( ( object ) => object.parent !== null ) // avoid copying the camera or scene
					.map( ( object ) => clone( object ) );

				return;

			}

			if ( key === 'v' ) {

				event.preventDefault();

				if ( clipboard.length === 0 ) return;

				// clone the stored templates (not the templates themselves) so repeated
				// pastes don't share object references, and nudge so copies don't sit
				// exactly on top of the originals
				const commands = clipboard.map( ( template ) => {

					const object = clone( template );
					object.position.x += 0.5;
					object.position.z += 0.5;
					return new AddObjectCommand( editor, object );

				} );

				if ( commands.length === 1 ) {

					editor.execute( commands[ 0 ] );

				} else {

					editor.execute( new MultiCmdsCommand( editor, commands ) );

				}

				editor.selector.setSelection( commands.map( ( command ) => command.object ) );

				return;

			}

			if ( key === 'g' ) {

				event.preventDefault();

				const selection = editor.selector.selection;
				if ( selection.length < 2 ) return;

				const group = new THREE.Group();
				group.name = 'Group';
				// marks this as a grouping container (vs. a regular model) for MQTT
				// undo/redo sync, since its children are tracked independently
				group.userData.wvIsGroupContainer = true;

				// center the group's own pivot on the selection's combined bounding
				// box (matches how most 3D tools place a new group's origin), then
				// re-express each member's position relative to that new pivot so
				// nothing visually jumps
				const selectionBox = new THREE.Box3();
				editor.selector.getSelectionBox( selectionBox );
				const center = selectionBox.getCenter( new THREE.Vector3() );
				group.position.copy( center );

				const commands = [ new AddObjectCommand( editor, group ) ];
				const newPositions = new Map();

				for ( const object of selection ) {

					const oldPosition = object.position.clone();
					const newPosition = oldPosition.clone().sub( center );
					object.position.copy( newPosition );
					newPositions.set( object, newPosition );

					commands.push( new SetPositionCommand( editor, object, newPosition, oldPosition ) );
					commands.push( new MoveObjectCommand( editor, object, group ) );

				}

				editor.execute( new MultiCmdsCommand( editor, commands ) );

				editor.selector.select( group );

				// remote clients don't have the new group yet, so send it fully
				// serialized; each reparented member is then moved into it by uuid.
				// Children are excluded from this JSON (remote already has them as
				// separate top-level objects) and reparented individually below instead.
				const groupChildren = group.children.slice();
				group.children = [];
				const groupJSON = group.toJSON();
				group.children = groupChildren;

				editor.sendMqtt( 'reAddObject', {
					uuid: group.uuid,
					parentUuid: editor.scene.uuid,
					index: editor.scene.children.indexOf( group ),
					objectJSON: groupJSON,
				} );

				groupChildren.forEach( ( object, index ) => {

					// remote clients must re-express the member's position relative to
					// the new group pivot too, same as the local newPositions computed above
					editor.sendMqtt( 'setObjectPosition', {
						objectName: object.name,
						uuid: object.uuid,
						newPosition: newPositions.get( object ),
					} );

					editor.sendMqtt( 'moveObject', {
						uuid: object.uuid,
						newParentUuid: group.uuid,
						index: index,
					} );

				} );

				return;

			}

		}

		switch ( event.key.toLowerCase() ) {

			case 'backspace':

				event.preventDefault(); // prevent browser back

				// fall-through

			case 'delete': {

				const objects = editor.selector.selection;

				const commands = [];

				for ( let i = 0; i < objects.length; i ++ ) {

					const object = objects[ i ];

					if ( object.parent === null ) continue; // avoid deleting the camera or scene

					if ( object.isSpotLight || object.isDirectionalLight ) {

						commands.push( new RemoveObjectCommand( editor, object ) );
						commands.push( new RemoveObjectCommand( editor, object.target ) );

					} else {

						commands.push( new RemoveObjectCommand( editor, object ) );

					}

					editor.sendMqtt( 'removeObject', { uuid: object.uuid } );

				}

				if ( commands.length === 1 ) {

					editor.execute( commands[ 0 ] );

				} else if ( commands.length > 1 ) {

					editor.execute( new MultiCmdsCommand( editor, commands ) );

				}

				break;

			}

			case config.getKey( 'settings/shortcuts/selectAll' ): {

				if ( event.altKey === true || event.ctrlKey === true || event.metaKey === true ) break;

				// toggle between selecting and deselecting all scene objects

				const objects = editor.scene.children;
				const selection = editor.selector.selection;

				let allSelected = objects.length > 0;

				for ( let i = 0; i < objects.length; i ++ ) {

					if ( selection.indexOf( objects[ i ] ) === - 1 ) {

						allSelected = false;
						break;

					}

				}

				if ( allSelected === true ) {

					editor.deselect();

				} else {

					editor.selector.setSelection( objects );

				}

				break;

			}

			case config.getKey( 'settings/shortcuts/translate' ):

				signals.transformModeChanged.dispatch( 'translate' );

				break;

			case config.getKey( 'settings/shortcuts/rotate' ):

				signals.transformModeChanged.dispatch( 'rotate' );

				break;

			case config.getKey( 'settings/shortcuts/scale' ):

				signals.transformModeChanged.dispatch( 'scale' );

				break;
/*
			case config.getKey( 'settings/shortcuts/undo' ):

				if ( IS_MAC ? event.metaKey : event.ctrlKey ) {

					event.preventDefault(); // Prevent browser specific hotkeys

					if ( event.shiftKey ) {

						editor.redo();

					} else {

						editor.undo();

					}

				}

				break;
*/
			case config.getKey( 'settings/shortcuts/focus' ):

				if ( editor.selected !== null ) {

					editor.focus( editor.selected );

				}

				break;

			case config.getKey( 'settings/shortcuts/perspective' ):

				editor.setCameraType( 'perspective' );

				break;

			case config.getKey( 'settings/shortcuts/orthographic' ):

				editor.setCameraType( 'orthographic' );

				break;

		}

	} );

	return container;

}

export { SidebarSettingsShortcuts };
