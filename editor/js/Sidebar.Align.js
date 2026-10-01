import * as THREE from 'three';

import { UIPanel, UIRow, UIText, UIButton } from './libs/ui.js';

import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { MultiCmdsCommand } from './commands/MultiCmdsCommand.js';

/**
 * Photoshop-style align tools for a multi-object selection: for each axis,
 * moves every selected object so its near/mid/far extent matches the
 * combined bounding box of the whole selection.
 */
function SidebarAlign( editor ) {

	const signals = editor.signals;
	const selector = editor.selector;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '10px' );
	container.setPaddingBottom( '10px' );
	container.setDisplay( 'none' );

	container.add( new UIText( 'ALIGN SELECTION' ).setFontSize( '12px' ).setMarginBottom( '6px' ) );

	const alignments = [
		{ key: 'min', label: 'Near' },
		{ key: 'mid', label: 'Mid' },
		{ key: 'max', label: 'Far' }
	];

	for ( const axis of [ 'x', 'y', 'z' ] ) {

		const row = new UIRow();
		row.add( new UIText( axis.toUpperCase() ).setWidth( '20px' ) );

		for ( const alignment of alignments ) {

			const button = new UIButton( alignment.label );
			button.setMarginLeft( '4px' );
			button.onClick( () => align( axis, alignment.key ) );
			row.add( button );

		}

		container.add( row );

	}

	const _box = new THREE.Box3();
	const _objectBox = new THREE.Box3();

	function extentOf( box, axis, mode ) {

		if ( 'min' === mode ) return box.min[ axis ];
		if ( 'max' === mode ) return box.max[ axis ];
		return ( box.min[ axis ] + box.max[ axis ] ) / 2;

	}

	function align( axis, mode ) {

		const selection = selector.selection;
		if ( selection.length < 2 ) return;

		selector.getSelectionBox( _box );
		const target = extentOf( _box, axis, mode );

		const commands = [];

		for ( const object of selection ) {

			_objectBox.setFromObject( object, true );

			const delta = target - extentOf( _objectBox, axis, mode );
			if ( Math.abs( delta ) < 1e-6 ) continue;

			const oldPosition = object.position.clone();
			object.position[ axis ] += delta;

			editor.sendMqtt(
				'setObjectPosition',
				{
					objectName: object.name,
					uuid: object.uuid,
					newPosition: object.position,
				}
			);

			commands.push( new SetPositionCommand( editor, object, object.position, oldPosition ) );

		}

		if ( commands.length === 1 ) {

			editor.execute( commands[ 0 ] );

		} else if ( commands.length > 1 ) {

			editor.execute( new MultiCmdsCommand( editor, commands ) );

		}

	}

	function updateVisibility() {

		container.setDisplay( selector.selection.length > 1 ? '' : 'none' );

	}

	signals.objectSelected.add( updateVisibility );

	return container;

}

export { SidebarAlign };
