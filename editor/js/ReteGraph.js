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
//
// Scene Timeline ('timeline-track' node, see below) is absorbed INTO this one engine via
// buildUnifiedGraph() rather than being a second independently-ticking system - this is
// what eliminates the "two engines write the same property, last one wins" class of bug
// (e.g. a Timeline track and a Rete oscillator both targeting the same object's position.x).
import { evaluateTrack, wrapTrackTime, wrapMasterTime, liftTimelineToNodes } from './SceneTimeline.js';

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

// Each op declares its arity (1 = unary 'a' only, 2 = binary 'a'/'b', 3 = ternary
// 'a'/'b'/'c') so the renderer (ReteGraphRenderer.js) knows which input sockets/inline
// controls to show for the currently selected op - the 'math' node itself always has
// all 3 sockets/inputs available to wire, this just declutters the UI for unused ones.
const MATH_OPS = {
	add: { arity: 2, fn: ( a, b ) => a + b },
	sub: { arity: 2, fn: ( a, b ) => a - b },
	mul: { arity: 2, fn: ( a, b ) => a * b },
	div: { arity: 2, fn: ( a, b ) => ( b === 0 ? 0 : a / b ) },
	min: { arity: 2, fn: ( a, b ) => Math.min( a, b ) },
	max: { arity: 2, fn: ( a, b ) => Math.max( a, b ) },
	// True modulo (always non-negative), not raw JS '%' (which can return negative) -
	mod: { arity: 2, fn: ( a, b ) => ( b === 0 ? 0 : ( ( a % b ) + b ) % b ) },
	pow: { arity: 2, fn: ( a, b ) => Math.pow( a, b ) },
	atan2: { arity: 2, fn: ( a, b ) => Math.atan2( a, b ) },
	lerp: { arity: 3, fn: ( a, b, c ) => a + ( b - a ) * c },
	floor: { arity: 1, fn: ( a ) => Math.floor( a ) },
	ceil: { arity: 1, fn: ( a ) => Math.ceil( a ) },
	round: { arity: 1, fn: ( a ) => Math.round( a ) },
	trunc: { arity: 1, fn: ( a ) => Math.trunc( a ) },
	abs: { arity: 1, fn: ( a ) => Math.abs( a ) },
	sign: { arity: 1, fn: ( a ) => Math.sign( a ) },
	sqrt: { arity: 1, fn: ( a ) => Math.sqrt( a ) },
	exp: { arity: 1, fn: ( a ) => Math.exp( a ) },
	log: { arity: 1, fn: ( a ) => Math.log( a ) },
	sin: { arity: 1, fn: ( a ) => Math.sin( a ) },
	cos: { arity: 1, fn: ( a ) => Math.cos( a ) },
	tan: { arity: 1, fn: ( a ) => Math.tan( a ) },
	asin: { arity: 1, fn: ( a ) => Math.asin( a ) },
	acos: { arity: 1, fn: ( a ) => Math.acos( a ) },
	atan: { arity: 1, fn: ( a ) => Math.atan( a ) },
};

function mapRange( value, inMin, inMax, outMin, outMax ) {
	const span = inMax - inMin;
	const t = span === 0 ? 0 : ( value - inMin ) / span;
	return outMin + t * ( outMax - outMin );
}

const COMPARE_OPS = {
	gt: ( a, b ) => a > b,
	lt: ( a, b ) => a < b,
	gte: ( a, b ) => a >= b,
	lte: ( a, b ) => a <= b,
	eq: ( a, b ) => a === b,
	neq: ( a, b ) => a !== b,
};

const LOGIC_OPS = {
	and: ( a, b ) => a && b,
	or: ( a, b ) => a || b,
	not: ( a ) => ! a,
	xor: ( a, b ) => a !== b,
};

// Mulberry32 - tiny deterministic PRNG so a given `seed` reproduces the same sequence
// across editor/player/reloads (not cryptographic, just needs to be fast + seedable).
function nextSeeded( data ) {
	if ( typeof data._seedState !== 'number' ) data._seedState = ( Number( data.seed ) || 0 ) >>> 0;
	data._seedState = ( data._seedState + 0x6D2B79F5 ) | 0;
	let t = Math.imul( data._seedState ^ ( data._seedState >>> 15 ), 1 | data._seedState );
	t = ( t + Math.imul( t ^ ( t >>> 7 ), 61 | t ) ) ^ t;
	return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;
}

// Stateful nodes (impulse/damp/play-sample) normally persist their per-tick state (last
// trigger, smoothed value, ...) directly on `data` - fine for a single standalone node,
// but WRONG when the same node is re-evaluated once per pair inside a 'midi-pair-loop'
// (each pair needs its OWN independent decay/edge-detection, not one shared value).
// Falls back to `data` itself outside a loop, so non-loop graphs are unaffected.
function getIterationState( data, context ) {
	if ( context && context.iteratorUuid ) {
		if ( ! data._state ) data._state = {};
		if ( ! data._state[ context.iteratorUuid ] ) data._state[ context.iteratorUuid ] = {};
		return data._state[ context.iteratorUuid ];
	}
	return data;
}

const NODE_DEFAULTS = {
	time: {},
	constant: { value: 0 },
	oscillator: { waveform: 'sine', frequency: 1, amplitude: 1, offset: 0, phase: 0 },
	math: { op: 'add', a: 0, b: 0, c: 0 },
	clamp: { value: 0, min: 0, max: 1 },
	'map-range': { value: 0, inMin: 0, inMax: 1, outMin: 0, outMax: 1 },
	vector3: { x: 0, y: 0, z: 0 },
	'vector3-decompose': { x: 0, y: 0, z: 0 },
	color: { hex: '#ffffff' },
	'property-get': { target_uuid: '', property: 'position.y' },
	'property-set': { target_uuid: '', property: 'position.y', loop_id: '' },
	'text-set': { target_uuid: '', text: '' },
	'timeline-track': { target_uuid: '', property: 'position.y', keyframes: [], loop: false },
	compare: { op: 'gt', a: 0, b: 0 },
	logic: { op: 'and', a: false, b: false },
	'flip-flop': { trigger: false },
	impulse: { trigger: false },
	random: { mode: 'continuous', min: 0, max: 1, seed: 1, trigger: false },
	damp: { value: 0, rate: 5 },
	'audio-analyser': { target_uuid: '' },
	watch: { loop_id: '' },
	'iterator-index': {},
	'group-set': { group_uuid: '', property: 'position.y' },
	'midi-input': { source: 'device', mode: 'note', channel: 0, number: 60 },
	switch: { condition: false, ifTrue: 1, ifFalse: 0 },
	'play-sample': { target_uuid: '', loop_id: '' },
	'midi-pair-list': { pairs: [] }, // [{ uuid, number }] - wire its 'pairs' output into a 'midi-pair-loop'
	'iterator-pair': {},
	'midi-pair-loop': { pairs: [] }, // fallback when 'pairs' input isn't wired
};

const NODE_TYPES = {
	time: {
		label: 'Time',
		description: 'Outputs the graph\'s elapsed seconds and last frame delta.',
		inputs: [],
		outputs: [ 'seconds', 'delta' ],
		compute: ( data, getInput, context ) => ( { seconds: context.time, delta: context.delta || 0 } ),
	},
	constant: {
		label: 'Constant',
		description: 'A fixed, user-editable number.',
		inputs: [],
		outputs: [ 'value' ],
		compute: ( data ) => ( { value: data.value } ),
	},
	oscillator: {
		label: 'Oscillator',
		description: 'Repeating sine/triangle/square/sawtooth wave over time.',
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
		description: 'Arithmetic/trig/rounding op on 1-3 numbers (arity depends on the chosen op).',
		inputs: [ 'a', 'b', 'c' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => {
			const opDef = MATH_OPS[ data.op ] || MATH_OPS.add;
			const a = Number( getInput( 'a' ) );
			const b = Number( getInput( 'b' ) );
			const c = Number( getInput( 'c' ) );
			const args = opDef.arity === 1 ? [ a ] : opDef.arity === 3 ? [ a, b, c ] : [ a, b ];
			return { value: opDef.fn( ...args ) };
		},
	},
	clamp: {
		label: 'Clamp',
		description: 'Restricts a value to the [min, max] range.',
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
		description: 'Rescales a value from one [inMin, inMax] range to [outMin, outMax].',
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
		description: 'Combines separate x/y/z numbers into one vector.',
		inputs: [ 'x', 'y', 'z' ],
		outputs: [ 'vector' ],
		compute: ( data, getInput ) => ( {
			vector: { x: Number( getInput( 'x' ) ), y: Number( getInput( 'y' ) ), z: Number( getInput( 'z' ) ) },
		} ),
	},
	'vector3-decompose': {
		label: 'Break Vector3',
		description: 'Splits a vector into separate x/y/z number outputs.',
		inputs: [ 'vector' ],
		outputs: [ 'x', 'y', 'z' ],
		compute: ( data, getInput ) => {
			const v = getInput( 'vector' ) || data;
			return { x: Number( v.x ), y: Number( v.y ), z: Number( v.z ) };
		},
	},
	color: {
		label: 'Color',
		description: 'A hex color string, pickable via the swatch control.',
		inputs: [ 'hex' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => ( { value: String( getInput( 'hex' ) || '#ffffff' ) } ),
	},
	'property-get': {
		label: 'Get Property',
		description: 'Reads a live property off a chosen scene object.',
		inputs: [],
		outputs: [ 'value' ],
		compute: ( data, getInput, context ) => ( { value: context.readProperty( data.target_uuid, data.property ) } ),
	},
	'property-set': {
		label: 'Set Property',
		description: 'Writes a value onto a chosen scene object\'s property every frame (wireable target_uuid - leave unwired to use the dropdown).',
		inputs: [ 'value', 'target_uuid' ],
		outputs: [],
		compute: ( data, getInput, context ) => {
			context.applyProperty( getInput( 'target_uuid' ), data.property, getInput( 'value' ) );
			return {};
		},
	},
	'text-set': {
		label: 'Set Text',
		description: 'Rewrites a 3D Text object\'s string (only re-extrudes the geometry when the text actually changes - wireable target_uuid, leave unwired to use the dropdown).',
		inputs: [ 'text', 'target_uuid' ],
		outputs: [],
		compute: ( data, getInput, context ) => {
			const text = String( getInput( 'text' ) ?? '' );
			if ( text !== data._lastAppliedText ) {
				data._lastAppliedText = text;
				context.setObjectText( getInput( 'target_uuid' ), text );
			}
			return {};
		},
	},
	'timeline-track': {
		label: 'Timeline Track',
		description: 'Plays an authored keyframe sequence onto a property every frame (edit keyframes in the node body) - the unified replacement for the old separate Scene Timeline engine.',
		inputs: [ 't', 'target_uuid' ],
		outputs: [],
		compute: ( data, getInput, context ) => {
			const keyframes = Array.isArray( data.keyframes ) ? data.keyframes.slice().sort( ( a, b ) => a.time - b.time ) : [];
			if ( ! keyframes.length ) return {};
			const rawT = Number( getInput( 't' ) ?? context.time );
			// _masterDuration/_masterLoop are only set on tracks lifted from a legacy Scene
			// Timeline (see liftTimelineToNodes) - a freshly-authored node has duration 0,
			// which wrapMasterTime treats as "no master wrap", i.e. just raw elapsed time.
			const masterT = wrapMasterTime( rawT, Number( data._masterDuration ) || 0, !! data._masterLoop );
			const trackTime = wrapTrackTime( keyframes, masterT, !! data.loop );
			const value = evaluateTrack( keyframes, trackTime );
			if ( value === undefined ) return {};
			context.applyProperty( getInput( 'target_uuid' ), data.property, value );
			return {};
		},
	},
	compare: {
		label: 'Compare',
		description: 'Outputs true/false from comparing a to b (>, <, >=, <=, ==, !=).',
		inputs: [ 'a', 'b' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => {
			const op = COMPARE_OPS[ data.op ] || COMPARE_OPS.gt;
			return { value: op( Number( getInput( 'a' ) ), Number( getInput( 'b' ) ) ) };
		},
	},
	logic: {
		label: 'Logic',
		description: 'Boolean AND/OR/NOT/XOR of two inputs.',
		inputs: [ 'a', 'b' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => {
			const op = LOGIC_OPS[ data.op ] || LOGIC_OPS.and;
			return { value: !! op( !! getInput( 'a' ), !! getInput( 'b' ) ) };
		},
	},
	'flip-flop': {
		label: 'Flip-Flop',
		description: 'Toggles true/false each time `trigger` rises from off to on.',
		inputs: [ 'trigger' ],
		outputs: [ 'value' ],
		// Toggles its persisted boolean state on each rising edge of `trigger` - the only
		// node type (besides impulse/random) that mutates `data` across ticks rather than
		// being a pure function of its inputs, since "remember the last toggle" has no
		// other representation in a pull-based per-tick evaluator.
		compute: ( data, getInput ) => {
			const triggerValue = !! getInput( 'trigger' );
			const rising = triggerValue && ! data._prevTrigger;
			data._prevTrigger = triggerValue;
			if ( data._state === undefined ) data._state = false;
			if ( rising ) data._state = ! data._state;
			return { value: data._state };
		},
	},
	impulse: {
		label: 'Impulse',
		description: 'Pulses true for a single tick when `trigger` rises from off to on.',
		inputs: [ 'trigger' ],
		outputs: [ 'value' ],
		// Outputs true for exactly the one tick where `trigger` rises from falsy to truthy.
		compute: ( data, getInput, context ) => {
			const state = getIterationState( data, context );
			const triggerValue = !! getInput( 'trigger' );
			const rising = triggerValue && ! state._prevTrigger;
			state._prevTrigger = triggerValue;
			return { value: rising };
		},
	},
	random: {
		label: 'Random',
		description: 'Seeded random number between min/max - continuous or re-rolled per trigger.',
		inputs: [ 'trigger', 'min', 'max' ],
		outputs: [ 'value' ],
		// 'continuous' mode re-rolls every tick; 'trigger' mode only re-rolls on a rising
		// edge of `trigger`, holding its value otherwise - same edge-detection as impulse.
		compute: ( data, getInput ) => {
			const min = Number( getInput( 'min' ) );
			const max = Number( getInput( 'max' ) );
			const triggerValue = !! getInput( 'trigger' );
			const rising = triggerValue && ! data._prevTrigger;
			data._prevTrigger = triggerValue;
			const shouldRoll = data.mode !== 'trigger' || rising || data._value === undefined;
			if ( shouldRoll ) data._value = min + nextSeeded( data ) * ( max - min );
			return { value: data._value };
		},
	},
	damp: {
		label: 'Damp (Smooth)',
		description: 'Smooths a value toward its target over time at the given rate.',
		inputs: [ 'value', 'rate' ],
		outputs: [ 'value' ],
		// Frame-rate-independent exponential smoothing toward `value` at the given `rate`
		// (higher = snappier). Persists `_current` across ticks the same way flip-flop/
		// impulse/random persist their own state on `data` (or, inside a loop, per-pair).
		compute: ( data, getInput, context ) => {
			const state = getIterationState( data, context );
			const target = Number( getInput( 'value' ) );
			const rate = Number( getInput( 'rate' ) );
			if ( typeof state._current !== 'number' || ! isFinite( state._current ) ) state._current = target;
			const delta = Math.max( 0, Number( context.delta ) || 0 );
			const t = 1 - Math.exp( - rate * delta );
			state._current = state._current + ( target - state._current ) * t;
			return { value: state._current };
		},
	},
	// Editor-only debug sink - has no effect on the scene, just surfaces its input's live
	// value in the node body (see ReteGraphRenderer.js/ReteGraphWindow.js). Not ported to
	// reteGraphEngine.ts since the r3f player has no equivalent UI to display it in.
	watch: {
		label: 'Watch',
		description: 'Editor-only debug node - shows its input\'s live value, no scene effect.',
		inputs: [ 'value' ],
		outputs: [],
		compute: ( data, getInput ) => {
			data._lastValue = getInput( 'value' );
			return {};
		},
	},
	// Editor-side preview always reads zero (no audio plays in this authoring surface) -
	// context.readAudioLevels is only wired up by the r3f player (see ReteGraphPlayer.tsx).
	'audio-analyser': {
		label: 'Audio Analyser',
		description: 'Bass/mid/treble/overall levels from a model\'s ambient audio (r3f player only).',
		inputs: [],
		outputs: [ 'bass', 'mid', 'treble', 'level' ],
		compute: ( data, getInput, context ) => {
			if ( ! context.readAudioLevels ) return { bass: 0, mid: 0, treble: 0, level: 0 };
			return context.readAudioLevels( data.target_uuid );
		},
	},
	// Source node reading the per-member index/count injected by a 'group-set' node's
	// evaluation loop (see evaluateInputWithContext/evaluateGraph below). Outside of that
	// loop (e.g. wired straight into a property-set) it always reads index 0 of 1.
	'iterator-index': {
		label: 'Iterator Index',
		description: 'Current index/count/t (0-1) - only varies per-member inside a Group Set node.',
		inputs: [],
		outputs: [ 'index', 'count', 't' ],
		compute: ( data, getInput, context ) => {
			const count = Math.max( 1, Number( context.iteratorCount ) || 1 );
			const index = Number( context.iteratorIndex ) || 0;
			return { index, count, t: count > 1 ? index / ( count - 1 ) : 0 };
		},
	},
	// Sink node, like 'property-set' but targets EVERY member of a chosen group - see the
	// special-cased handling in evaluateGraph() below, which re-runs this node's 'value'
	// input chain once per member with a fresh iteratorIndex/iteratorCount in context (so
	// an upstream 'iterator-index' node can vary the result per member, e.g. to arrange
	// pre-placed duplicate objects into a grid/circle/line). Does NOT create or destroy
	// objects - only existing group members already present in the scene are affected.
	'group-set': {
		label: 'Set Group Property',
		description: 'Writes a value onto every member of a chosen group, each frame (wire Iterator Index upstream for per-member variation).',
		inputs: [ 'value' ],
		outputs: [],
		// Never actually invoked by evaluateGraph() - kept as a safe no-op in case anything
		// else ever calls compute() on this node type directly outside the special path.
		compute: () => ( {} ),
	},
	'midi-input': {
		label: 'MIDI Input',
		description: 'Reads a live note/CC from a connected device, or from the scene\'s MIDI sequence file (wireable number - e.g. from an Iterator Pair).',
		inputs: [ 'number' ],
		outputs: [ 'value', 'gate' ],
		compute: ( data, getInput, context ) => {
			const number = getInput( 'number' );
			if ( data.source === 'sequence' ) {
				return context.readMidiSequence ? context.readMidiSequence( data.mode, data.channel, number ) : { value: 0, gate: false };
			}
			return context.readMidi ? context.readMidi( data.mode, data.channel, number ) : { value: 0, gate: false };
		},
	},
	switch: {
		label: 'Switch',
		description: 'Picks ifTrue or ifFalse based on a boolean condition - works for numbers, strings (e.g. colors), or any value.',
		inputs: [ 'condition', 'ifTrue', 'ifFalse' ],
		outputs: [ 'value' ],
		compute: ( data, getInput ) => ( { value: getInput( 'condition' ) ? getInput( 'ifTrue' ) : getInput( 'ifFalse' ) } ),
	},
	// One-shot velocity-tiered sample trigger - on a rising edge of `trigger`, picks the
	// target object's own audio_trigger_s/m/l/xl ACF field by `velocity` (raw MIDI 0-127:
	// xl>=100, l:[50,100), m:[31,50), s:[1,31)) and plays it via positional audio. Mirrors
	// the original Foundscape SoundshapeModel.tsx/Sound.tsx thresholds exactly.
	'play-sample': {
		label: 'Play Sample',
		description: 'Plays a one-shot velocity-tiered sample on a scene object each time trigger rises (wireable target_uuid - e.g. from an Iterator Pair).',
		inputs: [ 'trigger', 'velocity', 'target_uuid' ],
		outputs: [],
		compute: ( data, getInput, context ) => {
			const state = getIterationState( data, context );
			const triggerValue = !! getInput( 'trigger' );
			const rising = triggerValue && ! state._prevTrigger;
			state._prevTrigger = triggerValue;
			if ( rising && context.playSample ) {
				context.playSample( getInput( 'target_uuid' ), Number( getInput( 'velocity' ) ) || 0 );
			}
			return {};
		},
	},
	// Holds the (object uuid, MIDI note) list a 'midi-pair-loop' iterates over - a plain
	// source node, no side effects. Separated from the loop itself so the list can be
	// edited/generated independently of however many loops end up consuming it.
	'midi-pair-list': {
		label: 'MIDI Pair List',
		description: 'A list of (object, MIDI note) pairs - wire its "pairs" output into a MIDI Pair Loop.',
		inputs: [],
		outputs: [ 'pairs' ],
		compute: ( data ) => ( { pairs: Array.isArray( data.pairs ) ? data.pairs : [] } ),
	},
	// Source node reading the current iteration's object uuid/note number injected by a
	// 'midi-pair-loop' (see evaluateNodeWithContext/evaluateGraph below) - mirrors
	// 'iterator-index' (used by 'group-set') but for pair-keyed loops. Outside a loop
	// (e.g. wired straight into something at the top level) it reads blank/zero.
	'iterator-pair': {
		label: 'Iterator Pair',
		description: 'Current (object uuid, MIDI note, index, count) - only varies per-pair inside a MIDI Pair Loop.',
		inputs: [],
		outputs: [ 'uuid', 'number', 'index', 'count' ],
		compute: ( data, getInput, context ) => {
			const count = Math.max( 1, Number( context.iteratorCount ) || 1 );
			const index = Number( context.iteratorIndex ) || 0;
			return { uuid: context.iteratorUuid || '', number: Number( context.iteratorNumber ) || 0, index, count };
		},
	},
	// The actual "for each pair" loop. Any 'property-set'/'play-sample'/'watch' node whose
	// `data.loop_id` equals THIS node's id is considered part of its body - excluded from
	// evaluateGraph()'s normal top-level dispatch (see below) and instead re-evaluated
	// once per pair from `pairs`, with a fresh per-iteration cache/context so each pair
	// gets independent state (see getIterationState) and sees its own uuid/number via any
	// wired-in 'iterator-pair' node. Upstream nodes feeding the body (midi-input, impulse,
	// damp, compare, switch, color, ...) do NOT need `loop_id` set themselves - they're
	// pulled naturally by the body sink's own input chain, same as any normal wiring.
	'midi-pair-loop': {
		label: 'MIDI Pair Loop',
		description: 'For each pair from "pairs" (wire from a MIDI Pair List), runs every node tagged "Loop: <this>" once, with that pair\'s object/note available via a wired Iterator Pair node.',
		inputs: [ 'pairs' ],
		outputs: [],
		// Never actually invoked by evaluateGraph() - see the special-cased dispatch below.
		compute: () => ( {} ),
	},
};

// Re-evaluates the small dependency chain feeding ONE input socket using its OWN fresh
// cache/visiting state and a caller-supplied context - used by 'group-set' to compute a
// per-member value (so an upstream 'iterator-index' node sees a different index/count
// for every member) without disturbing evaluateGraph()'s shared per-tick cache, which
// assumes a single context for the whole call.
function evaluateInputWithContext( graph, nodeId, inputKey, context ) {
	const nodesById = new Map( graph.nodes.map( ( n ) => [ n.id, n ] ) );
	const cache = new Map();
	const visiting = new Set();

	function findInputConnection( id, key ) {
		return graph.connections.find( ( c ) => c.target === id && c.targetInput === key );
	}

	function computeNode( id ) {
		if ( cache.has( id ) ) return cache.get( id );
		if ( visiting.has( id ) ) return {};
		const node = nodesById.get( id );
		const typeDef = node && NODE_TYPES[ node.type ];
		if ( ! node || ! typeDef ) return {};
		visiting.add( id );
		const getInput = ( key ) => {
			const connection = findInputConnection( id, key );
			if ( ! connection ) return node.data ? node.data[ key ] : undefined;
			const sourceOutputs = computeNode( connection.source );
			const value = sourceOutputs[ connection.sourceOutput ];
			return value !== undefined ? value : ( node.data ? node.data[ key ] : undefined );
		};
		const outputs = typeDef.compute( node.data || {}, getInput, context );
		visiting.delete( id );
		cache.set( id, outputs );
		return outputs;
	}

	const connection = findInputConnection( nodeId, inputKey );
	if ( ! connection ) {
		const node = nodesById.get( nodeId );
		return node && node.data ? node.data[ inputKey ] : undefined;
	}
	const outputs = computeNode( connection.source );
	return outputs[ connection.sourceOutput ];
}

// Re-evaluates one NODE (not just one input socket) with its OWN fresh cache/visiting
// state and a caller-supplied context - used by 'midi-pair-loop' to run a body sink
// (property-set/play-sample/watch) once per pair, so its whole upstream chain (and any
// stateful nodes in it, via getIterationState) sees that pair's own iteratorUuid/Number
// rather than evaluateGraph()'s shared per-tick cache/context.
function evaluateNodeWithContext( graph, nodeId, context ) {
	const nodesById = new Map( graph.nodes.map( ( n ) => [ n.id, n ] ) );
	const cache = new Map();
	const visiting = new Set();

	function findInputConnection( id, key ) {
		return graph.connections.find( ( c ) => c.target === id && c.targetInput === key );
	}

	function computeNode( id ) {
		if ( cache.has( id ) ) return cache.get( id );
		if ( visiting.has( id ) ) return {};
		const node = nodesById.get( id );
		const typeDef = node && NODE_TYPES[ node.type ];
		if ( ! node || ! typeDef ) return {};
		visiting.add( id );
		const getInput = ( key ) => {
			const connection = findInputConnection( id, key );
			if ( ! connection ) return node.data ? node.data[ key ] : undefined;
			const sourceOutputs = computeNode( connection.source );
			const value = sourceOutputs[ connection.sourceOutput ];
			return value !== undefined ? value : ( node.data ? node.data[ key ] : undefined );
		};
		const outputs = typeDef.compute( node.data || {}, getInput, context );
		visiting.delete( id );
		cache.set( id, outputs );
		return outputs;
	}

	computeNode( nodeId );
}

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

	graph.nodes.forEach( ( n ) => {
		// Nodes tagged with `data.loop_id` only run inside their owning 'midi-pair-loop's
		// per-pair iterations (see below) - never at the normal top level, even if they're
		// themselves a sink type.
		if ( n.data && n.data.loop_id ) return;

		if ( n.type === 'property-set' || n.type === 'watch' || n.type === 'play-sample' || n.type === 'text-set' || n.type === 'timeline-track' ) {
			computeNode( n.id );
		} else if ( n.type === 'group-set' ) {
			const members = context.getGroupMembers ? context.getGroupMembers( n.data.group_uuid ) : [];
			members.forEach( ( uuid, index ) => {
				const memberContext = Object.assign( {}, context, { iteratorIndex: index, iteratorCount: members.length } );
				const value = evaluateInputWithContext( graph, n.id, 'value', memberContext );
				context.applyProperty( uuid, n.data.property, value );
			} );
		} else if ( n.type === 'midi-pair-loop' ) {
			const wiredPairs = evaluateInputWithContext( graph, n.id, 'pairs', context );
			const pairs = Array.isArray( wiredPairs ) ? wiredPairs : ( Array.isArray( n.data.pairs ) ? n.data.pairs : [] );
			const bodyNodes = graph.nodes.filter( ( bn ) => bn.data && bn.data.loop_id === n.id );
			pairs.forEach( ( pair, index ) => {
				if ( ! pair || ! pair.uuid ) return;
				const iterationContext = Object.assign( {}, context, {
					iteratorUuid: pair.uuid,
					iteratorNumber: pair.number,
					iteratorIndex: index,
					iteratorCount: pairs.length,
				} );
				bodyNodes.forEach( ( bodyNode ) => {
					if ( bodyNode.type === 'property-set' || bodyNode.type === 'play-sample' || bodyNode.type === 'watch' ) {
						evaluateNodeWithContext( graph, bodyNode.id, iterationContext );
					}
				} );
			} );
		}
	} );
}

// Merges a legacy Scene Timeline's tracks (lifted into synthetic 'timeline-track' nodes,
// see liftTimelineToNodes()) into an authored rete graph, so evaluateGraph() drives BOTH
// from one unified pass instead of two independently-ticking engines. `respectAutoplay`
// defaults true (the r3f player's behavior - a timeline with autoplay=false contributes
// nothing); the editor's own always-on authoring preview (ReteGraphWindow.js) passes
// false so a track stays visible while being edited regardless of that player-only flag.
function buildUnifiedGraph( graph, timeline, respectAutoplay = true ) {
	const liftedNodes = liftTimelineToNodes( timeline, respectAutoplay );
	if ( ! liftedNodes.length ) return graph || { version: 1, nodes: [], connections: [] };
	return {
		version: ( graph && graph.version ) || 1,
		nodes: ( ( graph && graph.nodes ) || [] ).concat( liftedNodes ),
		connections: ( graph && graph.connections ) || [],
	};
}

export {
	uuidv4,
	parseReteGraph,
	serializeReteGraph,
	createReteNode,
	createReteConnection,
	evaluateGraph,
	buildUnifiedGraph,
	NODE_TYPES,
	NODE_DEFAULTS,
	MATH_OPS,
};
