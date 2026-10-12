// "Rete Interactions" graph authoring window - opened from the toolbar, shows the
// scene-wide Rete graph (real rete.js v2: NodeEditor + AreaPlugin + ConnectionPlugin,
// see ReteGraphRenderer.js for the hand-written vanilla-DOM node/connection renderer)
// and highlights nodes that target the currently selected object.
//
// Persistence: the graph lives at `editor.scene.userData.reteGraph` as a PLAIN OBJECT
// ({version,nodes,connections}) - same convention as Scene Timeline's `userData.timeline`.
// Only Menubar.Save.buttons.js (object -> JSON string, for the `rete_graph` ACF field)
// and index.html (JSON string -> object, via parseReteGraph) ever convert between the
// two forms; MqttConnector.js/SceneToJson.js pass the plain object as-is over MQTT.

import { UIDiv, UIButton, UIText } from './libs/ui.js';
import { NodeEditor, AreaPlugin, AreaExtensions, ConnectionPlugin, ConnectionPresets } from './libs/rete/rete-bundle.js';
import {
	createReteNode,
	evaluateGraph,
	NODE_TYPES,
} from './ReteGraph.js';
import { attachReteRenderer } from './ReteGraphRenderer.js';
import { readPropertyValue, applyPropertyValue, getAnimatablePropertiesForObject } from './SceneTimeline.js';

let stylesInjected = false;
function injectStylesOnce() {
	if ( stylesInjected ) return;
	stylesInjected = true;
	const style = document.createElement( 'style' );
	style.textContent = `
		.ReteGraphWindow-content { width: 90vw; height: 80vh; max-width: 1400px; display: flex; flex-direction: column; padding: 0; }
		.rete-toolbar { display:flex; align-items:center; gap:6px; padding:6px 10px; border-bottom:1px solid #444; flex-shrink:0; flex-wrap:wrap; }
		.rete-toolbar select, .rete-toolbar button { font-size: 11px; }
		.rete-area-container { position:relative; flex:1; overflow:hidden; background:#2b2b2b; background-image: radial-gradient(#444 1px, transparent 1px); background-size: 20px 20px; }
		.rete-node { position:absolute; top:0; left:0; min-width:160px; background:#3a3a3a; border:1px solid #555; border-radius:6px; color:#eee; font-size:11px; box-shadow:0 2px 6px rgba(0,0,0,0.4); user-select:none; }
		.rete-node-selected { border-color:#2196F3; }
		.rete-node-highlighted { border-color:#ffb300; box-shadow:0 0 0 2px rgba(255,179,0,0.5); }
		.rete-node-header { padding:4px 8px; background:#4a4a4a; border-radius:6px 6px 0 0; font-weight:bold; cursor:grab; display:flex; justify-content:space-between; }
		.rete-node-remove { cursor:pointer; opacity:0.6; padding:0 2px; }
		.rete-node-remove:hover { opacity:1; color:#ff5252; }
		.rete-node-body { padding:4px 0; }
		.rete-node-controls { padding:4px 8px; }
		.rete-socket-row { display:flex; align-items:center; gap:4px; padding:2px 8px; position:relative; }
		.rete-socket-row-output { justify-content:flex-end; }
		.rete-socket-label { color:#ccc; }
		.rete-socket { width:10px; height:10px; border-radius:50%; background:#8bc34a; border:1px solid #333; cursor:crosshair; flex-shrink:0; }
		.rete-socket-input { background:#64b5f6; }
		.rete-inline-control { width:56px; font-size:10px; }
		.rete-inline-select { font-size:10px; }
		.rete-connection { position:absolute; top:0; left:0; pointer-events:none; }
		.rete-connection-svg { position:absolute; overflow:visible; }
		.rete-connection-path { fill:none; stroke:#9e9e9e; stroke-width:2px; }
	`;
	document.head.appendChild( style );
}

function flattenSceneObjects( scene ) {
	const list = [];
	scene.traverse( ( obj ) => {
		if ( obj === scene ) return;
		list.push( obj );
	} );
	return list;
}

function ReteGraphWindow( editor ) {

	injectStylesOnce();

	const signals = editor.signals;

	let built = false;
	let nodeEditor, area, connection;
	const graphNodesById = new Map(); // id -> { type, data, position }
	let rafId = null;

	const dom = new UIDiv();
	dom.setClass( 'Dialog' );
	dom.dom.style.display = 'none';
	this.dom = dom.dom;

	const background = new UIDiv();
	background.setClass( 'Dialog-background' );
	background.dom.addEventListener( 'click', () => this.close() );
	dom.add( background );

	const content = new UIDiv();
	content.setClass( 'Dialog-content ReteGraphWindow-content' );
	dom.add( content );

	const toolbar = new UIDiv();
	toolbar.setClass( 'rete-toolbar' );
	content.add( toolbar );

	toolbar.add( new UIText( 'Rete Interactions' ).setClass( 'Label' ) );

	const addSelect = document.createElement( 'select' );
	Object.keys( NODE_TYPES ).forEach( ( type ) => {
		const option = document.createElement( 'option' );
		option.value = type;
		option.textContent = NODE_TYPES[ type ].label;
		addSelect.appendChild( option );
	} );
	toolbar.dom.appendChild( addSelect );

	const addButton = new UIButton( 'Add Node' );
	addButton.onClick( () => addNode( addSelect.value ) );
	toolbar.add( addButton );

	const closeButton = new UIButton( 'Close' );
	closeButton.dom.style.marginLeft = 'auto';
	closeButton.onClick( () => this.close() );
	toolbar.add( closeButton );

	const areaContainer = document.createElement( 'div' );
	areaContainer.className = 'rete-area-container';
	content.dom.appendChild( areaContainer );

	// ─── Setup (lazy, first open only) ─────────────────────────────────────────────

	function setup() {
		if ( built ) return;
		built = true;

		nodeEditor = new NodeEditor();
		area = new AreaPlugin( areaContainer );
		connection = new ConnectionPlugin();

		nodeEditor.use( area );
		area.use( connection );
		connection.addPreset( ConnectionPresets.classic.setup() );
		AreaExtensions.selectableNodes( area, AreaExtensions.selector(), { accumulating: AreaExtensions.accumulateOnCtrl() } );

		attachReteRenderer( nodeEditor, area, connection, {
			getGraphNode: ( id ) => graphNodesById.get( id ),
			getConnections: () => nodeEditor.getConnections(),
			getSceneObjects: () => flattenSceneObjects( editor.scene ),
			getAnimatableProperties: ( obj ) => getAnimatablePropertiesForObject( obj ),
			isHighlighted: ( reteNode ) => {
				const graphNode = graphNodesById.get( reteNode.id );
				return !! ( editor.selected && graphNode && graphNode.data && graphNode.data.target_uuid === editor.selected.uuid );
			},
			onNodeDataChanged: () => persist(),
			onRemoveNode: ( id ) => removeNode( id ),
		} );

		area.addPipe( ( context ) => {
			if ( context.type === 'nodetranslated' ) {
				const graphNode = graphNodesById.get( context.data.id );
				if ( graphNode ) graphNode.position = [ context.data.position.x, context.data.position.y ];
				persist();
			}
			return context;
		} );

		nodeEditor.addPipe( ( context ) => {
			if ( context.type === 'connectioncreated' || context.type === 'connectionremoved' ) persist();
			return context;
		} );

		// loadGraph() is NOT called here - this.open() always calls it exactly once per
		// open (including the first), so calling it here too would race two concurrent
		// loadGraph() runs against the same nodeEditor/graphNodesById and double-add nodes.
	}

	// ─── Graph <-> live rete.js NodeEditor sync ─────────────────────────────────────

	function toReteNode( graphNode ) {
		const typeDef = NODE_TYPES[ graphNode.type ];
		const inputs = {};
		( typeDef ? typeDef.inputs : [] ).forEach( ( key ) => { inputs[ key ] = { multipleConnections: false }; } );
		const outputs = {};
		( typeDef ? typeDef.outputs : [] ).forEach( ( key ) => { outputs[ key ] = { multipleConnections: true }; } );
		return { id: graphNode.id, inputs, outputs, selected: false };
	}

	async function addNode( type ) {
		setup();
		const rect = areaContainer.getBoundingClientRect();
		const { k, x, y } = area.area.transform;
		const position = [ ( rect.width / 2 - x ) / k, ( rect.height / 2 - y ) / k ];
		const graphNode = createReteNode( type, position );
		graphNodesById.set( graphNode.id, graphNode );
		await nodeEditor.addNode( toReteNode( graphNode ) );
		await area.translate( graphNode.id, { x: position[ 0 ], y: position[ 1 ] } );
		persist();
	}

	async function removeNode( id ) {
		const connectionsToRemove = nodeEditor.getConnections().filter( ( c ) => c.source === id || c.target === id );
		for ( const c of connectionsToRemove ) await nodeEditor.removeConnection( c.id );
		await nodeEditor.removeNode( id );
		graphNodesById.delete( id );
		persist();
	}

	async function loadGraph() {
		await nodeEditor.clear();
		graphNodesById.clear();

		const stored = editor.scene.userData.reteGraph;
		const graph = ( stored && Array.isArray( stored.nodes ) && Array.isArray( stored.connections ) )
			? stored
			: { version: 1, nodes: [], connections: [] };

		for ( const graphNode of graph.nodes ) {
			graphNodesById.set( graphNode.id, graphNode );
			await nodeEditor.addNode( toReteNode( graphNode ) );
			const pos = graphNode.position || [ 0, 0 ];
			await area.translate( graphNode.id, { x: pos[ 0 ], y: pos[ 1 ] } );
		}
		for ( const c of graph.connections ) {
			// Guard against a persisted connection whose endpoint node failed to load.
			if ( ! graphNodesById.has( c.source ) || ! graphNodesById.has( c.target ) ) continue;
			await nodeEditor.addConnection( c );
		}
	}

	function persist() {
		const nodes = nodeEditor.getNodes().map( ( n ) => {
			const graphNode = graphNodesById.get( n.id );
			return { id: n.id, type: graphNode.type, data: graphNode.data, position: graphNode.position || [ 0, 0 ] };
		} );
		const connections = nodeEditor.getConnections().map( ( c ) => ( {
			id: c.id, source: c.source, sourceOutput: c.sourceOutput, target: c.target, targetInput: c.targetInput,
		} ) );
		editor.scene.userData.reteGraph = { version: 1, nodes, connections };
		signals.reteGraphChanged.dispatch();
	}

	// ─── Live preview while the window is open - direct-applies to the real viewport
	// objects, same "scrub overwrites live transform" semantics as Scene Timeline's
	// applyPropertyValue (SceneTimeline.js), not a separate evaluation copy.

	const clockStart = performance.now();
	let lastTime = clockStart;

	function tick() {
		rafId = requestAnimationFrame( tick );
		const now = performance.now();
		const time = ( now - clockStart ) / 1000;
		const delta = ( now - lastTime ) / 1000;
		lastTime = now;

		const graph = {
			nodes: nodeEditor.getNodes().map( ( n ) => graphNodesById.get( n.id ) ).filter( Boolean ),
			connections: nodeEditor.getConnections(),
		};

		evaluateGraph( graph, {
			time,
			delta,
			readProperty: ( uuid, property ) => {
				const obj = editor.scene.getObjectByProperty( 'uuid', uuid );
				return obj ? readPropertyValue( obj, property ) : undefined;
			},
			applyProperty: ( uuid, property, value ) => {
				const obj = editor.scene.getObjectByProperty( 'uuid', uuid );
				if ( obj ) applyPropertyValue( obj, property, value );
			},
		} );
	}

	// ─── Open/close ──────────────────────────────────────────────────────────────

	this.open = function () {
		setup();
		this.dom.style.display = '';
		loadGraph();
		if ( ! rafId ) rafId = requestAnimationFrame( tick );
	};

	this.close = function () {
		this.dom.style.display = 'none';
		if ( rafId ) {
			cancelAnimationFrame( rafId );
			rafId = null;
		}
	};

}

export { ReteGraphWindow };
