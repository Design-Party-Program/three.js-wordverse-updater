// Playback/transport for a parsed MIDI sequence file - a ref-counted-by-URL registry
// (same pattern as ambientAudioRegistry.js's player-side equivalent would be): fetches +
// parses the file once per URL, then advances a playhead each tick() call and tracks the
// last-seen note/CC state, so 'midi-input' nodes with source:'sequence' can read a plain
// snapshot each frame - identical shape to MidiRegistry.js's live-device readMidi().

import { parseMidiFile } from './MidiFileParser.js';

const entries = new Map(); // url -> entry

function key( channel, number ) {
	return channel + ':' + number;
}

function freshEntry() {
	return {
		parsed: null,
		playhead: 0,
		eventIndex: 0,
		notesByChannel: new Map(),
		notesAny: new Map(),
		ccByChannel: new Map(),
		ccAny: new Map(),
	};
}

function clearNoteState( entry ) {
	entry.notesByChannel.clear();
	entry.notesAny.clear();
	entry.ccByChannel.clear();
	entry.ccAny.clear();
}

function applyEvent( entry, e ) {
	if ( e.type === 'noteOn' || e.type === 'noteOff' ) {
		const on = e.type === 'noteOn';
		const state = { velocity: on ? e.velocity / 127 : 0, on };
		entry.notesByChannel.set( key( e.channel, e.note ), state );
		entry.notesAny.set( e.note, state );
	} else if ( e.type === 'cc' ) {
		const value = e.value / 127;
		entry.ccByChannel.set( key( e.channel, e.controller ), value );
		entry.ccAny.set( e.controller, value );
	}
}

function ensureSequenceLoaded( url ) {
	if ( ! url ) return null;
	let entry = entries.get( url );
	if ( ! entry ) {
		entry = freshEntry();
		entries.set( url, entry );
		fetch( url )
			.then( ( r ) => r.arrayBuffer() )
			.then( ( buf ) => {
				entry.parsed = parseMidiFile( buf );
			} )
			.catch( () => {} );
	}
	return entry;
}

// Advances the sequence's playhead by `deltaSeconds` and applies every event crossed.
// Call once per frame per scene (the scene only ever has one midi_sequence_file).
function tickMidiSequence( url, deltaSeconds, loop ) {
	const entry = ensureSequenceLoaded( url );
	if ( ! entry || ! entry.parsed ) return;
	const events = entry.parsed.events;
	const duration = entry.parsed.duration;

	entry.playhead += deltaSeconds;
	while ( entry.eventIndex < events.length && events[ entry.eventIndex ].time <= entry.playhead ) {
		applyEvent( entry, events[ entry.eventIndex ] );
		entry.eventIndex++;
	}

	if ( loop && duration > 0 && entry.playhead >= duration ) {
		entry.playhead = entry.playhead % duration;
		entry.eventIndex = 0;
		clearNoteState( entry );
		while ( entry.eventIndex < events.length && events[ entry.eventIndex ].time <= entry.playhead ) {
			applyEvent( entry, events[ entry.eventIndex ] );
			entry.eventIndex++;
		}
	}
}

function readMidiSequence( url, mode, channel, number ) {
	const entry = entries.get( url );
	if ( ! entry || ! entry.parsed ) return { value: 0, gate: false };
	const ch = Number( channel ) || 0;
	const num = Number( number ) || 0;
	if ( mode === 'cc' ) {
		const value = ch > 0 ? ( entry.ccByChannel.get( key( ch - 1, num ) ) || 0 ) : ( entry.ccAny.get( num ) || 0 );
		return { value, gate: false };
	}
	const state = ch > 0 ? entry.notesByChannel.get( key( ch - 1, num ) ) : entry.notesAny.get( num );
	return { value: state ? state.velocity : 0, gate: state ? state.on : false };
}

export { tickMidiSequence, readMidiSequence };
