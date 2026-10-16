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
import { attachReteRenderer, formatWatchValue } from './ReteGraphRenderer.js';
import { readPropertyValue, applyPropertyValue, getAnimatablePropertiesForObject } from './SceneTimeline.js';
import { ensureMidiAccess, readMidi } from './MidiRegistry.js';

let stylesInjected = false;
function injectStylesOnce() {
	if ( stylesInjected ) return;
	stylesInjected = true;
	const style = document.createElement( 'style' );
	style.textContent = `
		.ReteGraphWindow-content { width: 90vw; height: 80vh; max-width: 1400px; display: flex; flex-direction: column; padding: 0; }
		.rete-toolbar { display:flex; align-items:center; gap:6px; padding:6px 10px; border-bottom:1px solid #444; flex-shrink:0; flex-wrap:wrap; }
		.rete-toolbar select, .rete-toolbar button { font-size: 11px; }
		.rete-footer { display:flex; align-items:center; padding:6px 10px; border-top:1px solid #444; flex-shrink:0; }
		.rete-footer button { font-size: 11px; }
		.rete-node-description { font-size:11px; color:#999; font-style:italic; }
		.rete-area-container { position:relative; flex:1; overflow:hidden; background:#2b2b2b; background-image: radial-gradient(#444 1px, transparent 1px); background-size: 20px 20px; }
		.rete-node { position:absolute; top:0; left:0; min-width:160px; background:#3a3a3a; border:1px solid #555; border-radius:6px; color:#eee; font-size:11px; user-select:none; }
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
		.rete-watch-value { display:block; padding:4px 8px; font-family:monospace; font-size:11px; color:#8bc34a; word-break:break-all; }
		.rete-pair-list { max-height:160px; overflow-y:auto; padding:0 8px; }
		.rete-pair-row { display:flex; align-items:center; gap:4px; padding:2px 0; }
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
	const watchElements = new Map(); // id -> the 'watch' node's live-readout <span>
	let rafId = null;

	// getSceneObjects() backs several node types' target-object dropdowns and does a full
	// scene.traverse() - with hundreds of nodes each asking for it during one render pass,
	// cache it for the current animation frame instead of re-traversing per node.
	let sceneObjectsCache = null;
	function getCachedSceneObjects() {
		if ( ! sceneObjectsCache ) {
			sceneObjectsCache = flattenSceneObjects( editor.scene );
			requestAnimationFrame( () => { sceneObjectsCache = null; } );
		}
		return sceneObjectsCache;
	}

	// persist() walks every node+connection to rebuild userData.reteGraph - cheap once,
	// but 'nodetranslated' fires on every pointer-move while dragging a node, so coalesce
	// repeated calls within the same animation frame into a single pass.
	let persistScheduled = false;
	function schedulePersist() {
		if ( persistScheduled ) return;
		persistScheduled = true;
		requestAnimationFrame( () => {
			persistScheduled = false;
			persist();
		} );
	}

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

	const addDescription = new UIText( '' ).setClass( 'rete-node-description' );
	toolbar.add( addDescription );

	function updateAddDescription() {
		const typeDef = NODE_TYPES[ addSelect.value ];
		addDescription.setValue( typeDef && typeDef.description || '' );
	}
	addSelect.addEventListener( 'change', updateAddDescription );
	updateAddDescription();

	const closeButton = new UIButton( 'Close' );
	closeButton.dom.style.marginLeft = 'auto';
	closeButton.onClick( () => this.close() );
	toolbar.add( closeButton );

	const areaContainer = document.createElement( 'div' );
	areaContainer.className = 'rete-area-container';
	content.dom.appendChild( areaContainer );

	// 850+ node graphs (e.g. scene 1339's Foundscape emulation) stay heavy even with the
	// render-side perf fixes above, since this editor shares the main wp-admin page's
	// thread/DOM with the three.js viewport, MQTT, etc. Popping the graph out into its own
	// tab - no viewport, no MQTT, nothing else competing for the main thread - is the next
	// lever. The popout has its own Save button (PATCHes only `rete_graph`, see
	// rete-standalone.html) rather than sharing this window's full-scene persist().
	const footer = new UIDiv();
	footer.setClass( 'rete-footer' );
	content.add( footer );

	const popoutButton = new UIButton( '\u29c9 Open in new tab' );
	popoutButton.onClick( () => {
		const sceneId = editor.scene.userData.wpData && editor.scene.userData.wpData.id;
		if ( ! sceneId ) {
			alert( 'Save the scene at least once before opening the graph in a new tab.' );
			return;
		}
		const url = new URL( parent.window.location.href );
		url.searchParams.set( 'rete_standalone', '1' );
		url.searchParams.set( 'vr_post_id', sceneId );
		window.open( url.toString(), '_blank' );
		this.close();
	} );
	footer.add( popoutButton );

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
			getAllNodeIds: () => nodeEditor.getNodes().map( ( n ) => n.id ),
			getAllNodes: () => Array.from( graphNodesById.values() ),
			getSceneObjects: () => getCachedSceneObjects(),
			getAnimatableProperties: ( obj ) => getAnimatablePropertiesForObject( obj ),
			isHighlighted: ( reteNode ) => {
				const graphNode = graphNodesById.get( reteNode.id );
				return !! ( editor.selected && graphNode && graphNode.data && graphNode.data.target_uuid === editor.selected.uuid );
			},
			onNodeDataChanged: () => persist(),
			onRemoveNode: ( id ) => removeNode( id ),
			registerWatchElement: ( id, el ) => watchElements.set( id, el ),
		} );

		area.addPipe( ( context ) => {
			if ( context.type === 'nodetranslated' ) {
				const graphNode = graphNodesById.get( context.data.id );
				if ( graphNode ) graphNode.position = [ context.data.position.x, context.data.position.y ];
				schedulePersist();
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
		watchElements.delete( id );
		persist();
	}

	async function loadGraph() {
		// Capture the persisted graph BEFORE clear() - clear() removes the live
		// nodeEditor's connections/nodes one at a time, and each removal fires
		// 'connectionremoved'/'nodetranslated'-adjacent events that our own pipe below
		// reacts to by calling persist() - which overwrites userData.reteGraph with
		// whatever's left mid-teardown (eventually an empty graph). Reading `stored`
		// after clear() meant every reopen replayed that now-wiped data instead of
		// what was actually saved.
		const stored = editor.scene.userData.reteGraph;
		const graph = ( stored && Array.isArray( stored.nodes ) && Array.isArray( stored.connections ) )
			? stored
			: { version: 1, nodes: [], connections: [] };

		await nodeEditor.clear();
		graphNodesById.clear();
		watchElements.clear();

		for ( const graphNode of graph.nodes ) {
			graphNodesById.set( graphNode.id, graphNode );
			await nodeEditor.addNode( toReteNode( graphNode ) );
			const pos = graphNode.position || [ 0, 0 ];
			await area.translate( graphNode.id, { x: pos[ 0 ], y: pos[ 1 ] } );
		}

		// AreaPlugin's addNodeView() fires its node/socket 'render' events via a
		// fire-and-forget `void this.emit(...)` that editor.addNode() never awaits, so
		// ReteGraphRenderer's socketElements map can still be mid-update here - wiring a
		// connection before its sockets are registered makes it silently fail to render
		// (no DOM element to anchor to). Waiting a frame guarantees every microtask queued
		// above has flushed before we touch connections.
		await new Promise( ( resolve ) => requestAnimationFrame( resolve ) );

		const loadedConnectionIds = [];
		for ( const c of graph.connections ) {
			// Guard against a persisted connection whose endpoint node failed to load.
			if ( ! graphNodesById.has( c.source ) || ! graphNodesById.has( c.target ) ) {
				console.warn( 'Rete: connection skipped at load, endpoint node not found', {
					connection: c, knownNodeIds: Array.from( graphNodesById.keys() ),
				} );
				continue;
			}
			try {
				await nodeEditor.addConnection( c );
				loadedConnectionIds.push( c.id );
			} catch ( err ) {
				console.warn( 'Rete: nodeEditor.addConnection() threw while loading', { connection: c, err } );
			}
		}

		// On reopen, nodeEditor.clear()'s teardown (noderemoved/connectionremoved ->
		// unmount) adds extra pending microtasks on top of the add-phase ones the rAF
		// wait above already accounts for, so sockets can still lag behind the very
		// first connection render pass here. area.update() replays the connection's
		// render event from scratch, re-resolving sourceEl/targetEl against whatever is
		// currently in ReteGraphRenderer's socketElements map - safe/cheap to always do.
		await new Promise( ( resolve ) => requestAnimationFrame( resolve ) );
		for ( const id of loadedConnectionIds ) await area.update( 'connection', id );
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
			getGroupMembers: ( groupUuid ) => {
				const group = editor.scene.getObjectByProperty( 'uuid', groupUuid );
				return group && group.userData && group.userData.wvIsGroupContainer ? group.children.map( ( c ) => c.uuid ) : [];
			},
			readMidi: ( mode, channel, number ) => readMidi( mode, channel, number ),
		} );

		for ( const [ id, el ] of watchElements ) {
			const graphNode = graphNodesById.get( id );
			el.textContent = formatWatchValue( graphNode && graphNode.data && graphNode.data._lastValue );
		}
	}

	// ─── Open/close ──────────────────────────────────────────────────────────────

	this.open = function () {
		setup();
		this.dom.style.display = '';
		// Move keyboard focus off the viewport/sidebar so the editor's global Delete/Backspace
		// shortcut (Sidebar.Settings.Shortcuts.js) can't act on the scene selection while this
		// modal is up - that handler also checks isAnyDialogOpen() as the primary guard, this
		// is belt-and-suspenders for anything else listening on the previously-focused element.
		if ( document.activeElement && document.activeElement !== document.body ) document.activeElement.blur();
		ensureMidiAccess();
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
