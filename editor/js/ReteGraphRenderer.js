// Hand-written vanilla-DOM "render plugin" for rete.js v2's AreaPlugin/ConnectionPlugin.
//
// rete.js v2 only ships official render adapters for React/Vue/Angular/Svelte/Lit - none
// for plain DOM (confirmed against the retejs.org docs + the area-plugin/connection-plugin
// source). This editor has no build step and uses no UI framework (see Animation.js's
// hand-rolled Scene Timeline for the existing precedent of custom DOM-only authoring UI
// in this codebase), so rather than pull in a framework for one modal, this file
// replicates the ~150-line contract every official render plugin fulfills:
//
//   area.addPipe(context => {
//     if (context.type === 'render') {
//       // context.data.type is 'node' | 'connection' | 'socket'
//       // context.data.element is an empty container AreaPlugin/ConnectionPlugin
//       // already created and positioned/wired for drag+zoom+pick - we just need to
//       // fill it with content and (for sockets) tell ConnectionPlugin about it.
//     }
//   })
//
// See https://github.com/retejs/area-plugin (src/index.ts addNodeView/addConnectionView)
// and https://github.com/retejs/connection-plugin (src/index.ts render/socket handling).

import { NODE_TYPES } from './ReteGraph.js';

function el( tag, className, text ) {
	const node = document.createElement( tag );
	if ( className ) node.className = className;
	if ( text !== undefined ) node.textContent = text;
	return node;
}

// Below this zoom factor, nodes are too small on screen for their controls to be usable -
// skip building them (dropdowns/inputs, each potentially walking the whole scene for its
// options) entirely rather than pay the DOM cost for hundreds of invisible-detail nodes.
const LOD_ZOOM_THRESHOLD = 0.35;

// Keeps the 'watch' node's live readout compact regardless of the piped-in value's type.
function formatWatchValue( value ) {
	if ( value === undefined ) return '-';
	if ( typeof value === 'number' ) return value.toFixed( 3 );
	if ( typeof value === 'object' && value !== null ) {
		return Object.keys( value ).map( ( k ) => `${ k }:${ Number( value[ k ] ).toFixed( 2 ) }` ).join( ' ' );
	}
	return String( value );
}

// Renders one node's body into the (already-positioned) container AreaPlugin gives us.
// `reteNode` is rete's own lightweight bookkeeping object ({id,inputs,outputs,selected} -
// see toReteNode() in ReteGraphWindow.js) and carries NO type/data; the real graph node
// (type/data/position) is looked up via `hooks.getGraphNode(id)`.
// `hooks` lets the owning window (ReteGraphWindow.js) supply live scene data without this
// module needing to import Editor.js / three.js itself.
function renderNodeBody( container, reteNode, area, hooks ) {

	const id = reteNode.id;
	const node = hooks.getGraphNode( id );

	container.innerHTML = '';
	container.classList.add( 'rete-node' );
	container.classList.toggle( 'rete-node-selected', !! reteNode.selected );
	container.classList.toggle( 'rete-node-highlighted', hooks.isHighlighted( reteNode ) );

	const typeDef = node && NODE_TYPES[ node.type ];
	if ( ! typeDef ) {
		container.appendChild( el( 'div', 'rete-node-header', ( node ? node.type : id ) + ' (unknown)' ) );
		return;
	}

	const header = el( 'div', 'rete-node-header', typeDef.label );
	const removeBtn = el( 'span', 'rete-node-remove', '\u00d7' );
	removeBtn.title = 'Delete node';
	removeBtn.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
	removeBtn.addEventListener( 'click', () => hooks.onRemoveNode( id ) );
	header.appendChild( removeBtn );
	container.appendChild( header );

	const body = el( 'div', 'rete-node-body' );
	container.appendChild( body );

	const zoom = area.area.transform.k || 1;
	const lowDetail = zoom < LOD_ZOOM_THRESHOLD;

	const connectedInputs = new Set(
		hooks.getConnections().filter( ( c ) => c.target === id ).map( ( c ) => c.targetInput )
	);

	// Outputs first (top), inputs below - purely cosmetic ordering choice.
	typeDef.outputs.forEach( ( key ) => {
		const row = el( 'div', 'rete-socket-row rete-socket-row-output' );
		row.appendChild( el( 'span', 'rete-socket-label', key ) );
		const socket = el( 'div', 'rete-socket rete-socket-output' );
		row.appendChild( socket );
		body.appendChild( row );
		void area.emit( { type: 'render', data: { element: socket, type: 'socket', nodeId: id, side: 'output', key } } );
	} );

	typeDef.inputs.forEach( ( key ) => {
		const row = el( 'div', 'rete-socket-row rete-socket-row-input' );
		const socket = el( 'div', 'rete-socket rete-socket-input' );
		row.appendChild( socket );
		row.appendChild( el( 'span', 'rete-socket-label', key ) );

		// target_uuid is a string (object uuid), not a number - renderInlineControl() only
		// supports numeric defaults, and target_uuid already has its own dropdown picker
		// below; still render its socket above so it can be wired from an Iterator Pair.
		// 'text' (text-set) is also a string, with its own text-input control below.
		if ( ! connectedInputs.has( key ) && ! lowDetail && key !== 'target_uuid' && key !== 'text' ) {
			row.appendChild( renderInlineControl( node, key, hooks ) );
		}

		body.appendChild( row );
		void area.emit( { type: 'render', data: { element: socket, type: 'socket', nodeId: id, side: 'input', key } } );
	} );

	// Node-specific config controls (not sockets) - e.g. oscillator waveform, math op,
	// and the property-get/set target+property pickers. Skipped when zoomed out (LOD):
	// these are the most expensive part per node (dropdowns, some backed by a full
	// scene walk) and illegible at that scale anyway.
	if ( ! lowDetail ) renderNodeControls( body, node, hooks );
}

function renderInlineControl( node, key, hooks ) {
	const value = node.data ? node.data[ key ] : undefined;
	const input = document.createElement( 'input' );
	input.className = 'rete-inline-control';
	input.type = 'number';
	input.step = 'any';
	input.value = typeof value === 'number' ? value : 0;
	input.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
	input.addEventListener( 'change', () => {
		node.data[ key ] = Number( input.value ) || 0;
		hooks.onNodeDataChanged( node );
	} );
	return input;
}

function select( options, value, onChange ) {
	const sel = document.createElement( 'select' );
	sel.className = 'rete-inline-select';
	options.forEach( ( opt ) => {
		const option = document.createElement( 'option' );
		option.value = opt;
		option.textContent = opt;
		if ( opt === value ) option.selected = true;
		sel.appendChild( option );
	} );
	sel.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
	sel.addEventListener( 'change', () => onChange( sel.value ) );
	return sel;
}

// Lets a 'property-set'/'play-sample'/'watch' node declare "I'm part of this loop's
// body" (data.loop_id) - the same dropdown-picker pattern as target_uuid/group_uuid
// elsewhere in this file, just picking a 'midi-pair-loop' node instead of a scene object.
function renderLoopPicker( body, node, hooks ) {
	const row = el( 'div', 'rete-node-controls' );
	row.appendChild( el( 'span', 'rete-socket-label', 'Loop: ' ) );

	const loopSelect = document.createElement( 'select' );
	loopSelect.className = 'rete-inline-select';
	const none = document.createElement( 'option' );
	none.value = '';
	none.textContent = '(none - run at top level)';
	loopSelect.appendChild( none );
	hooks.getAllNodes().filter( ( n ) => n.type === 'midi-pair-loop' ).forEach( ( loopNode ) => {
		const option = document.createElement( 'option' );
		option.value = loopNode.id;
		option.textContent = `Loop ${ loopNode.id.slice( 0, 8 ) }`;
		if ( loopNode.id === node.data.loop_id ) option.selected = true;
		loopSelect.appendChild( option );
	} );
	loopSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
	loopSelect.addEventListener( 'change', () => {
		node.data.loop_id = loopSelect.value;
		hooks.onNodeDataChanged( node );
	} );
	row.appendChild( loopSelect );
	body.appendChild( row );
}

function renderNodeControls( body, node, hooks ) {
	if ( node.type === 'oscillator' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'sine', 'triangle', 'square', 'sawtooth' ], node.data.waveform, ( v ) => {
			node.data.waveform = v;
			hooks.onNodeDataChanged( node );
		} ) );
		body.appendChild( row );
	}

	if ( node.type === 'math' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'add', 'sub', 'mul', 'div', 'min', 'max' ], node.data.op, ( v ) => {
			node.data.op = v;
			hooks.onNodeDataChanged( node );
		} ) );
		body.appendChild( row );
	}

	if ( node.type === 'compare' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'gt', 'lt', 'gte', 'lte', 'eq', 'neq' ], node.data.op, ( v ) => {
			node.data.op = v;
			hooks.onNodeDataChanged( node );
		} ) );
		body.appendChild( row );
	}

	if ( node.type === 'logic' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'and', 'or', 'not', 'xor' ], node.data.op, ( v ) => {
			node.data.op = v;
			hooks.onNodeDataChanged( node );
		} ) );
		body.appendChild( row );
	}

	if ( node.type === 'random' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'continuous', 'trigger' ], node.data.mode, ( v ) => {
			node.data.mode = v;
			hooks.onNodeDataChanged( node );
		} ) );
		body.appendChild( row );
	}

	if ( node.type === 'watch' ) {
		const row = el( 'div', 'rete-node-controls' );
		const display = el( 'span', 'rete-watch-value', formatWatchValue( node.data._lastValue ) );
		row.appendChild( display );
		body.appendChild( row );
		hooks.registerWatchElement( node.id, display );
		renderLoopPicker( body, node, hooks );
	}

	if ( node.type === 'color' ) {
		const row = el( 'div', 'rete-node-controls' );
		const input = document.createElement( 'input' );
		input.type = 'color';
		input.value = node.data.hex || '#ffffff';
		input.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		input.addEventListener( 'change', () => {
			node.data.hex = input.value;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( input );
		body.appendChild( row );
	}

	if ( node.type === 'property-get' || node.type === 'property-set' ) {
		const row = el( 'div', 'rete-node-controls' );

		const targetSelect = document.createElement( 'select' );
		targetSelect.className = 'rete-inline-select';
		const blank = document.createElement( 'option' );
		blank.value = '';
		blank.textContent = '(select object)';
		targetSelect.appendChild( blank );
		hooks.getSceneObjects().forEach( ( obj ) => {
			const option = document.createElement( 'option' );
			option.value = obj.uuid;
			option.textContent = obj.name || obj.type;
			if ( obj.uuid === node.data.target_uuid ) option.selected = true;
			targetSelect.appendChild( option );
		} );
		targetSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		targetSelect.addEventListener( 'change', () => {
			node.data.target_uuid = targetSelect.value;
			hooks.onNodeDataChanged( node );
			renderPropertySelect();
		} );
		row.appendChild( targetSelect );

		const propertyContainer = el( 'div' );
		row.appendChild( propertyContainer );
		body.appendChild( row );

		function renderPropertySelect() {
			propertyContainer.innerHTML = '';
			const target = hooks.getSceneObjects().find( ( o ) => o.uuid === node.data.target_uuid );
			if ( ! target ) return;
			const properties = hooks.getAnimatableProperties( target );
			const propSelect = select( properties, node.data.property, ( v ) => {
				node.data.property = v;
				hooks.onNodeDataChanged( node );
			} );
			propertyContainer.appendChild( propSelect );
		}
		renderPropertySelect();

		if ( node.type === 'property-set' ) renderLoopPicker( body, node, hooks );
	}

	if ( node.type === 'text-set' ) {
		const row = el( 'div', 'rete-node-controls' );

		const targetSelect = document.createElement( 'select' );
		targetSelect.className = 'rete-inline-select';
		const blank = document.createElement( 'option' );
		blank.value = '';
		blank.textContent = '(select text object)';
		targetSelect.appendChild( blank );
		hooks.getSceneObjects()
			.filter( ( obj ) => obj.userData && obj.userData.wpData && obj.userData.wpData.type === 'text-3d' )
			.forEach( ( obj ) => {
				const option = document.createElement( 'option' );
				option.value = obj.uuid;
				option.textContent = obj.name || obj.type;
				if ( obj.uuid === node.data.target_uuid ) option.selected = true;
				targetSelect.appendChild( option );
			} );
		targetSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		targetSelect.addEventListener( 'change', () => {
			node.data.target_uuid = targetSelect.value;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( targetSelect );

		const textInput = document.createElement( 'input' );
		textInput.type = 'text';
		textInput.className = 'rete-inline-control';
		textInput.style.width = '100px';
		textInput.value = node.data.text || '';
		textInput.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		textInput.addEventListener( 'change', () => {
			node.data.text = textInput.value;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( textInput );

		body.appendChild( row );
	}

	if ( node.type === 'audio-analyser' ) {
		const row = el( 'div', 'rete-node-controls' );

		const targetSelect = document.createElement( 'select' );
		targetSelect.className = 'rete-inline-select';
		const blank = document.createElement( 'option' );
		blank.value = '';
		blank.textContent = '(select object)';
		targetSelect.appendChild( blank );
		hooks.getSceneObjects().forEach( ( obj ) => {
			const option = document.createElement( 'option' );
			option.value = obj.uuid;
			option.textContent = obj.name || obj.type;
			if ( obj.uuid === node.data.target_uuid ) option.selected = true;
			targetSelect.appendChild( option );
		} );
		targetSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		targetSelect.addEventListener( 'change', () => {
			node.data.target_uuid = targetSelect.value;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( targetSelect );
		row.appendChild( el( 'span', 'rete-node-description', '(no sound in editor preview)' ) );
		body.appendChild( row );
	}

	if ( node.type === 'group-set' ) {
		const row = el( 'div', 'rete-node-controls' );

		const groupSelect = document.createElement( 'select' );
		groupSelect.className = 'rete-inline-select';
		const blank = document.createElement( 'option' );
		blank.value = '';
		blank.textContent = '(select group)';
		groupSelect.appendChild( blank );
		hooks.getSceneObjects().filter( ( obj ) => obj.userData && obj.userData.wvIsGroupContainer ).forEach( ( obj ) => {
			const option = document.createElement( 'option' );
			option.value = obj.uuid;
			option.textContent = obj.name || 'Group';
			if ( obj.uuid === node.data.group_uuid ) option.selected = true;
			groupSelect.appendChild( option );
		} );
		groupSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		groupSelect.addEventListener( 'change', () => {
			node.data.group_uuid = groupSelect.value;
			hooks.onNodeDataChanged( node );
			renderPropertySelect();
		} );
		row.appendChild( groupSelect );

		const propertyContainer = el( 'div' );
		row.appendChild( propertyContainer );
		body.appendChild( row );

		function renderPropertySelect() {
			propertyContainer.innerHTML = '';
			const target = hooks.getSceneObjects().find( ( o ) => o.uuid === node.data.group_uuid );
			if ( ! target ) return;
			const properties = hooks.getAnimatableProperties( target );
			const propSelect = select( properties, node.data.property, ( v ) => {
				node.data.property = v;
				hooks.onNodeDataChanged( node );
			} );
			propertyContainer.appendChild( propSelect );
		}
		renderPropertySelect();
	}

	if ( node.type === 'midi-input' ) {
		const row = el( 'div', 'rete-node-controls' );
		row.appendChild( select( [ 'device', 'sequence' ], node.data.source || 'device', ( v ) => {
			node.data.source = v;
			hooks.onNodeDataChanged( node );
		} ) );
		row.appendChild( select( [ 'note', 'cc' ], node.data.mode, ( v ) => {
			node.data.mode = v;
			hooks.onNodeDataChanged( node );
		} ) );

		const channelInput = document.createElement( 'input' );
		channelInput.className = 'rete-inline-control';
		channelInput.type = 'number';
		channelInput.title = 'MIDI channel (0 = any)';
		channelInput.min = '0';
		channelInput.max = '16';
		channelInput.value = node.data.channel || 0;
		channelInput.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		channelInput.addEventListener( 'change', () => {
			node.data.channel = Number( channelInput.value ) || 0;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( channelInput );
		// 'number' is a wireable socket now (see ReteGraph.js) - its own inline numeric
		// default is rendered generically by the socket-row loop above, no need to repeat it here.

		body.appendChild( row );
	}

	if ( node.type === 'play-sample' ) {
		const row = el( 'div', 'rete-node-controls' );

		const targetSelect = document.createElement( 'select' );
		targetSelect.className = 'rete-inline-select';
		const blank = document.createElement( 'option' );
		blank.value = '';
		blank.textContent = '(select object)';
		targetSelect.appendChild( blank );
		hooks.getSceneObjects().forEach( ( obj ) => {
			const option = document.createElement( 'option' );
			option.value = obj.uuid;
			option.textContent = obj.name || obj.type;
			if ( obj.uuid === node.data.target_uuid ) option.selected = true;
			targetSelect.appendChild( option );
		} );
		targetSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		targetSelect.addEventListener( 'change', () => {
			node.data.target_uuid = targetSelect.value;
			hooks.onNodeDataChanged( node );
		} );
		row.appendChild( targetSelect );
		row.appendChild( el( 'span', 'rete-node-description', '(no sound in editor preview)' ) );
		body.appendChild( row );
		renderLoopPicker( body, node, hooks );
	}

	if ( node.type === 'midi-pair-list' ) {
		const listContainer = el( 'div', 'rete-pair-list' );
		body.appendChild( listContainer );

		function renderPairs() {
			listContainer.innerHTML = '';
			if ( ! Array.isArray( node.data.pairs ) ) node.data.pairs = [];
			node.data.pairs.forEach( ( pair, index ) => {
				const pairRow = el( 'div', 'rete-pair-row' );

				const objectSelect = document.createElement( 'select' );
				objectSelect.className = 'rete-inline-select';
				const blankOption = document.createElement( 'option' );
				blankOption.value = '';
				blankOption.textContent = '(select object)';
				objectSelect.appendChild( blankOption );
				hooks.getSceneObjects().forEach( ( obj ) => {
					const option = document.createElement( 'option' );
					option.value = obj.uuid;
					option.textContent = obj.name || obj.type;
					if ( obj.uuid === pair.uuid ) option.selected = true;
					objectSelect.appendChild( option );
				} );
				objectSelect.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
				objectSelect.addEventListener( 'change', () => {
					pair.uuid = objectSelect.value;
					hooks.onNodeDataChanged( node );
				} );
				pairRow.appendChild( objectSelect );

				const noteInput = document.createElement( 'input' );
				noteInput.className = 'rete-inline-control';
				noteInput.type = 'number';
				noteInput.title = 'Note or CC number (0-127)';
				noteInput.min = '0';
				noteInput.max = '127';
				noteInput.value = pair.number || 0;
				noteInput.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
				noteInput.addEventListener( 'change', () => {
					pair.number = Number( noteInput.value ) || 0;
					hooks.onNodeDataChanged( node );
				} );
				pairRow.appendChild( noteInput );

				const removeBtn = el( 'span', 'rete-node-remove', '\u00d7' );
				removeBtn.title = 'Remove pair';
				removeBtn.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
				removeBtn.addEventListener( 'click', () => {
					node.data.pairs.splice( index, 1 );
					hooks.onNodeDataChanged( node );
					renderPairs();
				} );
				pairRow.appendChild( removeBtn );

				listContainer.appendChild( pairRow );
			} );
		}
		renderPairs();

		const addRow = el( 'div', 'rete-node-controls' );
		const addButton = document.createElement( 'button' );
		addButton.textContent = '+ Add pair';
		addButton.addEventListener( 'pointerdown', ( e ) => e.stopPropagation() );
		addButton.addEventListener( 'click', () => {
			node.data.pairs.push( { uuid: '', number: 0 } );
			hooks.onNodeDataChanged( node );
			renderPairs();
		} );
		addRow.appendChild( addButton );
		body.appendChild( addRow );
	}

	if ( node.type === 'midi-pair-loop' ) {
		const row = el( 'div', 'rete-node-controls' );
		const bodyCount = hooks.getAllNodes().filter( ( n ) => n.data && n.data.loop_id === node.id ).length;
		row.appendChild( el( 'span', 'rete-node-description',
			`${ bodyCount } node${ bodyCount === 1 ? '' : 's' } tagged to this loop (set via their own "Loop" picker).` ) );
		body.appendChild( row );
	}
}

// Draws one connection as an SVG cubic-bezier path between its source/target socket
// DOM elements - recomputed on demand (not continuously) since area-plugin only tells
// us "something changed", not what, so the window re-triggers this via area.update().
function renderConnectionPath( element, connection, area, sourceSocketEl, targetSocketEl, overridePoint ) {
	element.classList.add( 'rete-connection' );
	if ( ! element.firstChild ) {
		const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'class', 'rete-connection-svg' );
		const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute( 'class', 'rete-connection-path' );
		svg.appendChild( path );
		element.appendChild( svg );
	}

	const holder = area.area.content.holder;
	const holderRect = holder.getBoundingClientRect();
	const k = area.area.transform.k || 1;

	function socketPoint( socketEl ) {
		const rect = socketEl.getBoundingClientRect();
		return {
			x: ( rect.left + rect.width / 2 - holderRect.left ) / k,
			y: ( rect.top + rect.height / 2 - holderRect.top ) / k,
		};
	}

	const start = sourceSocketEl ? socketPoint( sourceSocketEl ) : overridePoint;
	const end = targetSocketEl ? socketPoint( targetSocketEl ) : overridePoint;
	if ( ! start || ! end ) return;

	const dx = Math.max( 40, Math.abs( end.x - start.x ) / 2 );
	const d = `M ${ start.x } ${ start.y } C ${ start.x + dx } ${ start.y }, ${ end.x - dx } ${ end.y }, ${ end.x } ${ end.y }`;

	const svg = element.querySelector( '.rete-connection-svg' );
	const path = element.querySelector( '.rete-connection-path' );
	const minX = Math.min( start.x, end.x ) - 20;
	const minY = Math.min( start.y, end.y ) - 20;
	const w = Math.abs( end.x - start.x ) + 40;
	const h = Math.abs( end.y - start.y ) + 40;
	// viewBox stays "0 0 w h" (not "minX minY w h") since the path itself is already
	// shifted into that box via its own transform below - combining both offsets would
	// double-correct and draw the path far outside the visible connection element.
	svg.setAttribute( 'viewBox', `0 0 ${ w } ${ h }` );
	svg.style.left = minX + 'px';
	svg.style.top = minY + 'px';
	svg.style.width = w + 'px';
	svg.style.height = h + 'px';
	path.setAttribute( 'transform', `translate(${ -minX }, ${ -minY })` );
	path.setAttribute( 'd', d );
}

// Wires a vanilla renderer into an already-constructed NodeEditor+AreaPlugin+ConnectionPlugin
// trio. `hooks` - see calls above for the full shape - is supplied by ReteGraphWindow.js.
function attachReteRenderer( editor, area, connection, hooks ) {

	const socketElements = new Map(); // "nodeId::side::key" -> HTMLElement

	// Panning/zooming moves every connection on screen, but raw pointermove/wheel events
	// fire far more often than animation frames - coalesce the full-graph refresh to once
	// per frame instead of once per event.
	let pendingConnectionRefresh = null;
	function scheduleConnectionRefresh() {
		if ( pendingConnectionRefresh ) return;
		pendingConnectionRefresh = requestAnimationFrame( () => {
			pendingConnectionRefresh = null;
			hooks.getConnections().forEach( ( c ) => void area.update( 'connection', c.id ) );
		} );
	}

	// Crossing the LOD threshold changes every node's rendered content (controls shown/
	// hidden) - re-render all nodes, but only on the rare frame where the bucket flips.
	let lastLodBucket = ( ( area.area.transform.k || 1 ) < LOD_ZOOM_THRESHOLD ) ? 'low' : 'high';

	area.addPipe( ( context ) => {
		if ( ! context || typeof context !== 'object' ) return context;

		if ( context.type === 'render' ) {
			const { element, type, payload } = context.data;

			if ( type === 'node' ) {
				renderNodeBody( element, payload, area, hooks );
			} else if ( type === 'socket' ) {
				socketElements.set( `${ context.data.nodeId }::${ context.data.side }::${ context.data.key }`, element );
			} else if ( type === 'connection' ) {
				const sourceKey = `${ payload.source }::output::${ payload.sourceOutput }`;
				const targetKey = `${ payload.target }::input::${ payload.targetInput }`;
				const sourceEl = socketElements.get( sourceKey );
				const targetEl = socketElements.get( targetKey );
				if ( ! sourceEl || ! targetEl ) {
					// Surfaces exactly which socket lookup failed (and what IS registered)
					// instead of silently drawing nothing - this has been the recurring
					// failure point for connection rendering.
					console.warn( 'Rete: connection render skipped, missing socket element(s)', {
						connectionId: payload.id, sourceKey, targetKey,
						hasSource: !! sourceEl, hasTarget: !! targetEl,
						knownSockets: Array.from( socketElements.keys() ),
					} );
				}
				const overridePoint = context.data.start || context.data.end;
				renderConnectionPath( element, payload, area, sourceEl, targetEl, overridePoint );
			}
		}

		if ( context.type === 'nodetranslated' ) {
			// Only this node's own connections moved - no need to touch the other ~hundreds.
			const movedId = context.data.id;
			hooks.getConnections().filter( ( c ) => c.source === movedId || c.target === movedId )
				.forEach( ( c ) => void area.update( 'connection', c.id ) );
		}

		if ( context.type === 'zoomed' || context.type === 'translated' ) {
			scheduleConnectionRefresh();

			const bucket = ( ( area.area.transform.k || 1 ) < LOD_ZOOM_THRESHOLD ) ? 'low' : 'high';
			if ( bucket !== lastLodBucket ) {
				lastLodBucket = bucket;
				hooks.getAllNodeIds().forEach( ( id ) => void area.update( 'node', id ) );
			}
		}

		if ( context.type === 'unmount' ) {
			for ( const [ key, el2 ] of socketElements ) {
				if ( el2 === context.data.element ) socketElements.delete( key );
			}
		}

		return context;
	} );
}

export { attachReteRenderer, formatWatchValue };
