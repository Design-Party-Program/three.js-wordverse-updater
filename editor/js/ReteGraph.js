// Shared scene-wide "Rete Interactions" graph data model + pure evaluation engine.
// Mirrors wordverse-r3f-player's src/components/canvas/ReteGraph/reteGraphEngine.ts -
// keep both in sync if the node catalogue or evaluation rules change (same split as
// SceneTimeline.js / timelineEngine.ts).
//
// The graph itself is authored visually with real rete.js v2 (NodeEditor + AreaPlugin +
// ConnectionPlugin, see ReteGraphRenderer.js/ReteGraphWindow.js) but EXECUTION is a
// small hand-rolled pull-based interpreter over this plain JSON shape - this keeps the
// runtime trivial to port to the r3f player (no rete.js runtime dependency needed
// there), exactly like Scene Timeline's evaluator needed no authoring-library parity.

function uuidv4() {
	return '10000000-1000-4000-8000-100000000000'.replace( /[018]/g, c =>
		( +c ^ crypto.getRandomValues( new Uint8Array( 1 ) )[ 0 ] & 15 >> +c / 4 ).toString( 16 )
	);
}

// ACF reports an empty textarea as "" or false depending on context - normalize both
// to "no graph" rather than letting JSON.parse throw or silently produce garbage. Also
// skips anything that isn't even object-shaped (e.g. a stray placeholder value returned
// before the rete_graph ACF field has been re-imported on this site) without logging -
// a real serialized graph always starts with "{".
function parseReteGraph( raw ) {
	if ( ! raw || typeof raw !== 'string' ) return null;
	if ( raw.trim().charAt( 0 ) !== '{' ) return null;
	try {
		const parsed = JSON.parse( raw );
		if ( ! parsed || ! Array.isArray( parsed.nodes ) || ! Array.isArray( parsed.connections ) ) return null;
		return {
			version: Number( parsed.version ) || 1,
			nodes: parsed.nodes,
			connections: parsed.connections,
		};
	} catch ( err ) {
		console.error( 'Failed to parse rete graph JSON:', err );
		return null;
	}
}

function serializeReteGraph( graph ) {
	return JSON.stringify( {
		version: 1,
		nodes: graph.nodes,
		connections: graph.connections,
	} );
}

function createReteNode( type, position, data ) {
	return {
		id: uuidv4(),
		type,
		position: position || [ 0, 0 ],
		data: Object.assign( {}, NODE_DEFAULTS[ type ], data ),
	};
}

function createReteConnection( source, sourceOutput, target, targetInput ) {
	return { id: uuidv4(), source, sourceOutput, target, targetInput };
}

// ─── Node catalogue ─────────────────────────────────────────────────────────────────
// Each entry declares its sockets (for the UI) plus a pure `compute(data, getInput,
// context)` function returning an outputs object. `getInput(key)` resolves a connected
// upstream value, falling back to the node's own `data[key]` when nothing is wired in -
// this lets every numeric input double as an inline default/control, a common node-UX
// pattern that keeps simple graphs (e.g. one oscillator -> one property) wire-free.

const WAVEFORMS = {
	sine: ( t ) => Math.sin( t ),
	triangle: ( t ) => ( 2 / Math.PI ) * Math.asin( Math.sin( t ) ),
	square: ( t ) => Math.sign( Math.sin( t ) ) || 1,
	sawtooth: ( t ) => 2 * ( ( t / ( 2 * Math.PI ) ) - Math.floor( 0.5 + t / ( 2 * Math.PI ) ) ),
};

const MATH_OPS = {
	add: ( a, b ) => a + b,
	sub: ( a, b ) => a - b,
	mul: ( a, b ) => a * b,
	div: ( a, b ) => ( b === 0 ? 0 : a / b ),
	min: ( a, b ) => Math.min( a, b ),
	max: ( a, b ) => Math.max( a, b ),
};

function mapRange( value, inMin, inMax, outMin, outMax ) {
	const span = inMax - inMin;
	const t = span === 0 ? 0 : ( value - inMin ) / span;
	return outMin + t * ( outMax - outMin );
}

const NODE_DEFAULTS = {
	time: {},
	constant: { value: 0 },
	oscillator: { waveform: 'sine', frequency: 1, amplitude: 1, offset: 0, phase: 0 },
	math: { op: 'add', a: 0, b: 0 },
	clamp: { value: 0, min: 0, max: 1 },
	'map-range': { value: 0, inMin: 0, inMax: 1, outMin: 0, outMax: 1 },
	vector3: { x: 0, y: 0, z: 0 },
	'vector3-decompose': { x: 0, y: 0, z: 0 },
	color: { hex: '#ffffff' },
	'property-get': { target_uuid: '', property: 'position.y' },
	'property-set': { target_uuid: '', property: 'position.y' },
};

const NODE_TYPES = {
	time: {
		label: 'Time',
		inputs: [],
		outputs: [ 'seconds', 'delta' ],
		compute: ( data, getInput, context ) => ( { seconds: context.time, delta: context.delta || 0 } ),
	},
	constant: {
		label: 'Constant',
		inputs: [],
		outputs: [ 'value' ],
		compute: ( data ) => ( { value: data.value } ),
	},
	oscillator: {
		label: 'Oscillator',
		inputs: [ 'time', 'frequency', 'amplitude', 'offset', 'phase' ],
		outputs: [ 'value' ],
		compute: ( data, getInput, context ) => {
			const t = Number( getInput( 'time' ) ?? context.time );
			const frequency = Number( getInput( 'frequency' ) );
			const amplitude = Number( getInput( 'amplitude' ) );
			const offset = Number( getInput( 'offset' ) );
			const phase = Number( getInput( 'phase' ) );
			const wave = WAVEFORMS[ data.waveform ] || WAVEFORMS.sine;
			return { value: offset + amplitude * wave( 2 * Math.PI * frequency * t + phase ) };
		},
	},
	math: {
		label: 'Math',
		inputs: [ 'a', 'b' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => {
			const op = MATH_OPS[ data.op ] || MATH_OPS.add;
			return { value: op( Number( getInput( 'a' ) ), Number( getInput( 'b' ) ) ) };
		},
	},
	clamp: {
		label: 'Clamp',
		inputs: [ 'value', 'min', 'max' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => {
			const min = Number( getInput( 'min' ) );
			const max = Number( getInput( 'max' ) );
			return { value: Math.min( max, Math.max( min, Number( getInput( 'value' ) ) ) ) };
		},
	},
	'map-range': {
		label: 'Map Range',
		inputs: [ 'value', 'inMin', 'inMax', 'outMin', 'outMax' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => ( {
			value: mapRange(
				Number( getInput( 'value' ) ), Number( getInput( 'inMin' ) ), Number( getInput( 'inMax' ) ),
				Number( getInput( 'outMin' ) ), Number( getInput( 'outMax' ) )
			),
		} ),
	},
	vector3: {
		label: 'Vector3',
		inputs: [ 'x', 'y', 'z' ],
		outputs: [ 'vector' ],
		compute: ( data, getInput ) => ( {
			vector: { x: Number( getInput( 'x' ) ), y: Number( getInput( 'y' ) ), z: Number( getInput( 'z' ) ) },
		} ),
	},
	'vector3-decompose': {
		label: 'Break Vector3',
		inputs: [ 'vector' ],
		outputs: [ 'x', 'y', 'z' ],
		compute: ( data, getInput ) => {
			const v = getInput( 'vector' ) || data;
			return { x: Number( v.x ), y: Number( v.y ), z: Number( v.z ) };
		},
	},
	color: {
		label: 'Color',
		inputs: [ 'hex' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => ( { value: String( getInput( 'hex' ) || '#ffffff' ) } ),
	},
	'property-get': {
		label: 'Get Property',
		inputs: [],
		outputs: [ 'value' ],
		compute: ( data, getInput, context ) => ( { value: context.readProperty( data.target_uuid, data.property ) } ),
	},
	'property-set': {
		label: 'Set Property',
		inputs: [ 'value' ],
		outputs: [],
		compute: ( data, getInput, context ) => {
			context.applyProperty( data.target_uuid, data.property, getInput( 'value' ) );
			return {};
		},
	},
};

// Evaluates every 'property-set' sink node once, pulling its dependency chain on
// demand with per-tick memoization (`cache`) so a value shared by multiple sinks (a
// "diamond" dependency) is only computed once, and a cycle guard (`visiting`) so a
// mistakenly self-referential graph degrades to a warning instead of infinite recursion.
function evaluateGraph( graph, context ) {
	if ( ! graph || ! Array.isArray( graph.nodes ) ) return;

	const nodesById = new Map( graph.nodes.map( ( n ) => [ n.id, n ] ) );
	const cache = new Map();
	const visiting = new Set();

	function findInputConnection( nodeId, inputKey ) {
		return graph.connections.find( ( c ) => c.target === nodeId && c.targetInput === inputKey );
	}

	function computeNode( nodeId ) {
		if ( cache.has( nodeId ) ) return cache.get( nodeId );
		if ( visiting.has( nodeId ) ) {
			console.warn( 'Rete graph: cycle detected at node', nodeId );
			return {};
		}
		const node = nodesById.get( nodeId );
		const typeDef = node && NODE_TYPES[ node.type ];
		if ( ! node || ! typeDef ) return {};

		visiting.add( nodeId );

		const getInput = ( key ) => {
			const connection = findInputConnection( nodeId, key );
			if ( ! connection ) return node.data ? node.data[ key ] : undefined;
			const sourceOutputs = computeNode( connection.source );
			const value = sourceOutputs[ connection.sourceOutput ];
			return value !== undefined ? value : ( node.data ? node.data[ key ] : undefined );
		};

		const outputs = typeDef.compute( node.data || {}, getInput, context );

		visiting.delete( nodeId );
		cache.set( nodeId, outputs );
		return outputs;
	}

	graph.nodes
		.filter( ( n ) => n.type === 'property-set' )
		.forEach( ( n ) => computeNode( n.id ) );
}

export {
	uuidv4,
	parseReteGraph,
	serializeReteGraph,
	createReteNode,
	createReteConnection,
	evaluateGraph,
	NODE_TYPES,
	NODE_DEFAULTS,
};
