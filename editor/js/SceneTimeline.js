// Shared scene-timeline data model + evaluation engine for the WordVerse "Scene
// Timeline" feature (Animation.js's authoring UI, index.html's load path,
// Menubar.Save.buttons.js's save path, MqttConnector.js's live sync).
//
// Mirrors wordverse-r3f-player's src/components/canvas/SceneTimeline/timelineEngine.ts -
// keep both in sync if the node shape or evaluation rules change. Each node is
// deliberately shaped like a graph node (id/type/inputs/outputs) even though today's
// editor/player only ever read it as a flat list, so a future rete.js (Blueprint-style)
// graph editor can adopt the same stored data with minimal transformation.

function uuidv4() {
	return '10000000-1000-4000-8000-100000000000'.replace( /[018]/g, c =>
		( +c ^ crypto.getRandomValues( new Uint8Array( 1 ) )[ 0 ] & 15 >> +c / 4 ).toString( 16 )
	);
}

const EASINGS = {
	linear: ( t ) => t,
	easeInQuad: ( t ) => t * t,
	easeOutQuad: ( t ) => t * ( 2 - t ),
	easeInOutQuad: ( t ) => ( t < 0.5 ? 2 * t * t : - 1 + ( 4 - 2 * t ) * t ),
};

// ACF reports an empty textarea as "" or false depending on context - normalize both
// to "no timeline" rather than letting JSON.parse throw or silently produce garbage.
function parseTimeline( raw ) {
	if ( ! raw || typeof raw !== 'string' ) return null;
	try {
		const parsed = JSON.parse( raw );
		if ( ! parsed || ! Array.isArray( parsed.nodes ) ) return null;
		return {
			duration: Number( parsed.duration ) || 0,
			nodes: parsed.nodes,
			// Per-track ( "uuid::property" ) master-value snapshots that relative keyframes
			// (delta/factor/hsl-offset) are combined with. Absent/legacy tracks have no entry
			// here and are evaluated purely from each node's absolute `value`, unchanged.
			bases: ( parsed.bases && typeof parsed.bases === 'object' ) ? parsed.bases : {},
		};
	} catch ( err ) {
		console.error( 'Failed to parse scene timeline JSON:', err );
		return null;
	}
}

function createNode( { targetUuid, property, time, mode, value, delta, easing } ) {
	return {
		id: uuidv4(),
		type: 'keyframe',
		target_uuid: targetUuid,
		property,
		time,
		mode: mode || 'set',
		value, // baked absolute value - always kept in sync, read by legacy/unaware players
		delta, // relative-to-master value (only set for relative-capable properties)
		easing: easing || 'linear',
		inputs: {},
		outputs: {},
	};
}

function lerp( a, b, t ) { return a + ( b - a ) * t; }

function lerpValue( a, b, t ) {
	if ( typeof a === 'number' && typeof b === 'number' ) return lerp( a, b, t );
	if ( a && b && typeof a === 'object' && typeof b === 'object' ) {
		const out = {};
		Object.keys( a ).forEach( ( key ) => {
			out[ key ] = lerp( Number( a[ key ] ) || 0, Number( b[ key ] ) || 0, t );
		} );
		return out;
	}
	// booleans/strings aren't interpolatable - snap to the later value past the midpoint
	return t < 0.5 ? a : b;
}

// Groups timeline nodes by `${target_uuid}::${property}`, each list sorted by time.
function groupTracksByTarget( nodes ) {
	const map = new Map();
	nodes.forEach( ( node ) => {
		const key = node.target_uuid + '::' + node.property;
		const list = map.get( key ) || [];
		list.push( node );
		map.set( key, list );
	} );
	map.forEach( ( list ) => list.sort( ( a, b ) => a.time - b.time ) );
	return map;
}

// Evaluates one already-sorted track at time `t` by walking the keyframe list and
// picking/interpolating whatever `pick()` extracts from each node (the absolute
// `value` for legacy tracks, or the relative `delta` for master-relative ones).
// Returns undefined before the track's first keyframe (leaves the property untouched).
function interpolateField( nodes, t, pick ) {
	if ( ! nodes.length || t < nodes[ 0 ].time ) return undefined;

	let prev = nodes[ 0 ];
	let next = null;
	for ( let i = 0; i < nodes.length; i ++ ) {
		const node = nodes[ i ];
		if ( node.time <= t ) {
			prev = node;
		} else {
			next = node;
			break;
		}
	}

	// No upcoming node, or the upcoming node is a hard "set" not yet reached: hold at prev
	if ( ! next || next.mode !== 'tween' ) return pick( prev );

	const span = next.time - prev.time;
	if ( span <= 0 ) return pick( next );
	const rawT = Math.min( 1, Math.max( 0, ( t - prev.time ) / span ) );
	const easing = EASINGS[ next.easing || 'linear' ] || EASINGS.linear;
	return lerpValue( pick( prev ), pick( next ), easing( rawT ) );
}

function evaluateTrack( nodes, t ) {
	return interpolateField( nodes, t, ( n ) => n.value );
}

// Relative-track counterpart of evaluateTrack(): interpolates each node's `delta` (not
// `value`) and combines the result with the track's live master/base value. `normalize`
// should be true for rotation tracks, to keep wrapped angles in the -π..π range.
function evaluateRelativeTrack( nodes, t, base, op, normalize ) {
	const delta = interpolateField( nodes, t, ( n ) => ( n.delta !== undefined ? n.delta : n.value ) );
	if ( delta === undefined || base === undefined ) return undefined;
	return combineWithBase( base, delta, op, normalize );
}

// Per-property "how does a keyframe relate to the master value" table. Properties not
// listed here (visible, and any future enum/asset-reference property) are intentionally
// absolute-only - there's no sane numeric delta for a boolean or an asset path.
const RELATIVE_OPS = {
	position: 'add', 'position.x': 'add', 'position.y': 'add', 'position.z': 'add',
	rotation: 'add', 'rotation.x': 'add', 'rotation.y': 'add', 'rotation.z': 'add',
	scale: 'multiply', 'scale.x': 'multiply', 'scale.y': 'multiply', 'scale.z': 'multiply',
	fov: 'add', near: 'add', far: 'add', intensity: 'add',
	color: 'hsl', color_texture: 'hsl',
};

function getRelativeOp( property ) {
	return RELATIVE_OPS[ property ] || null;
}

function isVector( v ) { return !! v && typeof v === 'object' && 'x' in v; }

function normalizeAngle( rad ) {
	const twoPi = Math.PI * 2;
	let a = rad % twoPi;
	if ( a > Math.PI ) a -= twoPi;
	if ( a < - Math.PI ) a += twoPi;
	return a;
}

function hexToHsl( hex ) {
	const n = parseInt( String( hex || '#ffffff' ).replace( '#', '' ), 16 ) || 0xffffff;
	const r = ( ( n >> 16 ) & 255 ) / 255, g = ( ( n >> 8 ) & 255 ) / 255, b = ( n & 255 ) / 255;
	const max = Math.max( r, g, b ), min = Math.min( r, g, b );
	const l = ( max + min ) / 2;
	let h = 0, s = 0;
	const d = max - min;
	if ( d !== 0 ) {
		s = d / ( 1 - Math.abs( 2 * l - 1 ) );
		switch ( max ) {
			case r: h = ( ( g - b ) / d ) % 6; break;
			case g: h = ( b - r ) / d + 2; break;
			default: h = ( r - g ) / d + 4; break;
		}
		h *= 60;
		if ( h < 0 ) h += 360;
	}
	return { h, s, l };
}

function hslToHex( { h, s, l } ) {
	h = ( ( h % 360 ) + 360 ) % 360;
	s = Math.min( 1, Math.max( 0, s ) );
	l = Math.min( 1, Math.max( 0, l ) );
	const c = ( 1 - Math.abs( 2 * l - 1 ) ) * s;
	const x = c * ( 1 - Math.abs( ( h / 60 ) % 2 - 1 ) );
	const m = l - c / 2;
	let r1 = 0, g1 = 0, b1 = 0;
	if ( h < 60 ) { r1 = c; g1 = x; }
	else if ( h < 120 ) { r1 = x; g1 = c; }
	else if ( h < 180 ) { g1 = c; b1 = x; }
	else if ( h < 240 ) { g1 = x; b1 = c; }
	else if ( h < 300 ) { r1 = x; b1 = c; }
	else { r1 = c; b1 = x; }
	const toHex = ( v ) => Math.round( ( v + m ) * 255 ).toString( 16 ).padStart( 2, '0' );
	return '#' + toHex( r1 ) + toHex( g1 ) + toHex( b1 );
}

function combineWithBase( base, delta, op, normalize ) {
	let result;

	if ( op === 'multiply' ) {
		if ( typeof base === 'number' ) result = base * ( Number( delta ?? 1 ) );
		else if ( isVector( base ) ) {
			result = {
				x: base.x * ( delta?.x ?? 1 ),
				y: base.y * ( delta?.y ?? 1 ),
				z: base.z * ( delta?.z ?? 1 ),
			};
		} else result = base;
	} else if ( op === 'hsl' ) {
		const baseHsl = hexToHsl( base );
		result = hslToHex( {
			h: baseHsl.h + ( delta?.h || 0 ),
			s: baseHsl.s + ( delta?.s || 0 ),
			l: baseHsl.l + ( delta?.l || 0 ),
		} );
	} else {
		if ( typeof base === 'number' ) result = base + ( Number( delta ?? 0 ) );
		else if ( isVector( base ) ) {
			result = {
				x: base.x + ( delta?.x || 0 ),
				y: base.y + ( delta?.y || 0 ),
				z: base.z + ( delta?.z || 0 ),
			};
		} else result = base;
	}

	if ( normalize ) {
		if ( typeof result === 'number' ) result = normalizeAngle( result );
		else if ( isVector( result ) ) {
			result = { x: normalizeAngle( result.x ), y: normalizeAngle( result.y ), z: normalizeAngle( result.z ) };
		}
	}

	return result;
}

// Inverse of combineWithBase(): given the track's base and a freshly-authored absolute
// value, derives the delta/factor/hsl-offset to store on the keyframe.
function invertFromBase( base, absolute, op ) {
	const safeDiv = ( a, b ) => ( b === 0 ? 1 : a / b );

	if ( op === 'multiply' ) {
		if ( typeof base === 'number' ) return safeDiv( Number( absolute ), base );
		if ( isVector( base ) ) {
			return {
				x: safeDiv( absolute?.x ?? base.x, base.x ),
				y: safeDiv( absolute?.y ?? base.y, base.y ),
				z: safeDiv( absolute?.z ?? base.z, base.z ),
			};
		}
		return 1;
	}

	if ( op === 'hsl' ) {
		const baseHsl = hexToHsl( base );
		const absHsl = hexToHsl( absolute );
		return { h: absHsl.h - baseHsl.h, s: absHsl.s - baseHsl.s, l: absHsl.l - baseHsl.l };
	}

	if ( typeof base === 'number' ) return Number( absolute ) - base;
	if ( isVector( base ) ) {
		return {
			x: ( absolute?.x ?? base.x ) - base.x,
			y: ( absolute?.y ?? base.y ) - base.y,
			z: ( absolute?.z ?? base.z ) - base.z,
		};
	}
	return 0;
}

// Reads an object's CURRENT value for `property` (dot-path) - used when authoring a new
// "set"/"tween" keyframe from the object's live state in the viewport.
function readPropertyValue( object, property ) {
	if ( property === 'visible' ) return !! object.visible;
	if ( property === 'color_texture' ) {
		let hex = '#ffffff';
		object.traverse( ( child ) => {
			if ( child.isMesh && child.material && child.material.color ) {
				hex = '#' + child.material.color.getHexString();
			}
		} );
		return hex;
	}
	if ( property === 'color' && object.color ) return '#' + object.color.getHexString();
	const [ root, axis ] = property.split( '.' );
	if ( root === 'fov' || root === 'near' || root === 'far' || root === 'intensity' ) {
		return object[ root ];
	}
	const target = object[ root ];
	if ( ! target ) return undefined;
	if ( axis ) return target[ axis ];
	return { x: target.x, y: target.y, z: target.z };
}

// Applies a value to the object LIVE in the editor viewport, for scrub preview. Unlike
// the r3f player (which layers an offset on a wrapper group), the editor applies values
// DIRECTLY onto the real object since there's no separate wrapper here - scrubbing
// temporarily overwrites the live transform; reloading/deselecting restores the saved one.
function applyPropertyValue( object, property, value ) {
	if ( ! object || value === undefined ) return;

	if ( property === 'visible' ) {
		object.visible = !! value;
		return;
	}

	if ( property === 'color_texture' ) {
		const hex = String( value || '#ffffff' );
		object.traverse( ( child ) => {
			if ( child.isMesh ) {
				const mats = Array.isArray( child.material ) ? child.material : [ child.material ];
				mats.forEach( ( mat ) => { if ( mat && mat.color ) mat.color.set( hex ); } );
			}
		} );
		return;
	}

	if ( property === 'color' && object.color && object.color.set ) {
		object.color.set( String( value || '#ffffff' ) );
		return;
	}

	const [ root, axis ] = property.split( '.' );

	if ( root === 'fov' || root === 'near' || root === 'far' ) {
		object[ root ] = Number( value );
		if ( typeof object.updateProjectionMatrix === 'function' ) object.updateProjectionMatrix();
		return;
	}

	if ( root === 'intensity' ) {
		object.intensity = Number( value );
		return;
	}

	if ( root === 'position' || root === 'rotation' || root === 'scale' ) {
		const target = object[ root ];
		if ( ! target ) return;
		if ( axis ) {
			target[ axis ] = Number( value );
		} else if ( value && typeof value === 'object' ) {
			const fallback = root === 'scale' ? 1 : 0;
			target.x = Number( value.x ?? fallback );
			target.y = Number( value.y ?? fallback );
			target.z = Number( value.z ?? fallback );
		}
	}
}

// Per-type list of properties that can be keyed, shown in the Animation panel's
// property picker when an object of that type is selected.
function getAnimatablePropertiesForObject( object ) {
	const transform = [
		'position', 'position.x', 'position.y', 'position.z',
		'rotation', 'rotation.x', 'rotation.y', 'rotation.z',
		'scale', 'scale.x', 'scale.y', 'scale.z',
		'visible',
	];
	if ( object.isCamera ) return transform.concat( [ 'fov', 'near', 'far' ] );
	if ( object.isLight ) return transform.concat( [ 'intensity', 'color' ] );
	return transform.concat( [ 'color_texture' ] );
}

export {
	uuidv4,
	parseTimeline,
	createNode,
	groupTracksByTarget,
	evaluateTrack,
	evaluateRelativeTrack,
	getRelativeOp,
	combineWithBase,
	invertFromBase,
	readPropertyValue,
	applyPropertyValue,
	getAnimatablePropertiesForObject,
};
