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
		return { duration: Number( parsed.duration ) || 0, nodes: parsed.nodes };
	} catch ( err ) {
		console.error( 'Failed to parse scene timeline JSON:', err );
		return null;
	}
}

function createNode( { targetUuid, property, time, mode, value, easing } ) {
	return {
		id: uuidv4(),
		type: 'keyframe',
		target_uuid: targetUuid,
		property,
		time,
		mode: mode || 'set',
		value,
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

// Evaluates one already-sorted track at time `t`. Returns undefined before the track's
// first keyframe (leaves the property untouched).
function evaluateTrack( nodes, t ) {
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
	if ( ! next || next.mode !== 'tween' ) return prev.value;

	const span = next.time - prev.time;
	if ( span <= 0 ) return next.value;
	const rawT = Math.min( 1, Math.max( 0, ( t - prev.time ) / span ) );
	const easing = EASINGS[ next.easing || 'linear' ] || EASINGS.linear;
	return lerpValue( prev.value, next.value, easing( rawT ) );
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
	readPropertyValue,
	applyPropertyValue,
	getAnimatablePropertiesForObject,
};
