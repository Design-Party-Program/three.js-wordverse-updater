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

	container.add( new UIText( 'DISTRIBUTE EVENLY' ).setFontSize( '12px' ).setMarginBottom( '6px' ).setMarginTop( '10px' ) );

	const distributeRow = new UIRow();

	for ( const axis of [ 'x', 'y', 'z' ] ) {

		const button = new UIButton( axis.toUpperCase() );
		button.setMarginLeft( '4px' );
		button.onClick( () => distribute( axis ) );
		distributeRow.add( button );

	}

	container.add( distributeRow );

	const _box = new THREE.Box3();
	const _objectBox = new THREE.Box3();

	function extentOf( box, axis, mode ) {

		if ( 'min' === mode ) return box.min[ axis ];
		if ( 'max' === mode ) return box.max[ axis ];
		return ( box.min[ axis ] + box.max[ axis ] ) / 2;

	}

	/**
	 * Moves `object` by `delta` along `axis`, recording an undo-able command +
	 * MQTT sync, into the shared `commands` accumulator (skips near-zero deltas).
	 */
	function moveOnAxis( object, axis, delta, commands ) {

		if ( Math.abs( delta ) < 1e-6 ) return;

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

	function commit( commands ) {

		if ( commands.length === 1 ) {

			editor.execute( commands[ 0 ] );

		} else if ( commands.length > 1 ) {

			editor.execute( new MultiCmdsCommand( editor, commands ) );

		}

	}

	function align( axis, mode ) {

		const selection = selector.selection;
		if ( selection.length < 2 ) return;

		selector.getSelectionBox( _box );
		const target = extentOf( _box, axis, mode );

		const commands = [];

		for ( const object of selection ) {

			_objectBox.setFromObject( object, true );
			moveOnAxis( object, axis, target - extentOf( _objectBox, axis, mode ), commands );

		}

		commit( commands );

	}

	/**
	 * Distributes selected objects' centers evenly between the two extreme
	 * members along `axis` (Photoshop-style "distribute centers"); the first
	 * and last objects (by position on that axis) stay fixed.
	 */
	function distribute( axis ) {

		const selection = selector.selection;
		if ( selection.length < 3 ) return;

		const entries = selection.map( ( object ) => {

			_objectBox.setFromObject( object, true );
			return { object, center: extentOf( _objectBox, axis, 'mid' ) };

		} );

		entries.sort( ( a, b ) => a.center - b.center );

		const first = entries[ 0 ].center;
		const last = entries[ entries.length - 1 ].center;
		const step = ( last - first ) / ( entries.length - 1 );

		const commands = [];

		entries.forEach( ( entry, index ) => {

			if ( index === 0 || index === entries.length - 1 ) return;

			moveOnAxis( entry.object, axis, ( first + step * index ) - entry.center, commands );

		} );

		commit( commands );

	}

	function updateVisibility() {

		container.setDisplay( selector.selection.length > 1 ? '' : 'none' );

	}

	signals.objectSelected.add( updateVisibility );

	return container;

}

export { SidebarAlign };
