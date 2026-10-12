// Lazily opens a single shared Web MIDI connection for the whole editor session and
// tracks the last known value of every note/CC message seen, so the Rete 'midi-input'
// node can just read a plain snapshot each tick (no event handling inside the graph
// engine itself - same "read a live external source" shape as readProperty).

let requested = false;

const notesByChannel = new Map(); // "channel:note" -> { velocity, on }
const notesAny = new Map(); // note -> { velocity, on } (last message seen on any channel)
const ccByChannel = new Map(); // "channel:controller" -> 0-1
const ccAny = new Map(); // controller -> 0-1 (last message seen on any channel)

function key( channel, number ) {
	return channel + ':' + number;
}

function handleMessage( event ) {
	const [ status, data1, data2 ] = event.data;
	const command = status & 0xF0;
	const channel = status & 0x0F;

	if ( command === 0x90 || command === 0x80 ) {
		const on = command === 0x90 && data2 > 0;
		const state = { velocity: on ? data2 / 127 : 0, on };
		notesByChannel.set( key( channel, data1 ), state );
		notesAny.set( data1, state );
	} else if ( command === 0xB0 ) {
		const value = data2 / 127;
		ccByChannel.set( key( channel, data1 ), value );
		ccAny.set( data1, value );
	}
}

function attachInput( input ) {
	input.onmidimessage = handleMessage;
}

// Safe to call repeatedly - only the first call actually requests access. Browsers
// require a user gesture/permission prompt the first time, same as audio autoplay, so
// a connected device may not be live immediately after this call returns.
function ensureMidiAccess() {
	if ( requested || typeof navigator === 'undefined' || ! navigator.requestMIDIAccess ) return;
	requested = true;
	navigator.requestMIDIAccess().then( ( access ) => {
		access.inputs.forEach( attachInput );
		access.onstatechange = () => access.inputs.forEach( attachInput );
	} ).catch( () => {} );
}

// channel 0 means "any channel"; 1-16 matches that specific MIDI channel.
function readMidi( mode, channel, number ) {
	const ch = Number( channel ) || 0;
	const num = Number( number ) || 0;
	if ( mode === 'cc' ) {
		const value = ch > 0 ? ( ccByChannel.get( key( ch - 1, num ) ) || 0 ) : ( ccAny.get( num ) || 0 );
		return { value, gate: false };
	}
	const state = ch > 0 ? notesByChannel.get( key( ch - 1, num ) ) : notesAny.get( num );
	return { value: state ? state.velocity : 0, gate: state ? state.on : false };
}

export { ensureMidiAccess, readMidi };
