// Hand-rolled Standard MIDI File (SMF) parser - parses header+track chunks, merges all
// tracks into one time-sorted event stream, and converts ticks to seconds using the
// file's own tempo meta-events (defaults to 120 BPM if none are found). No npm deps -
// this editor has no build step. Mirrors wordverse-r3f-player's midiFileParser.ts exactly.

function decodeBase64DataUri( uri ) {
	const b64 = uri.indexOf( ',' ) >= 0 ? uri.split( ',' )[ 1 ] : uri;
	const bin = atob( b64 );
	const bytes = new Uint8Array( bin.length );
	for ( let i = 0; i < bin.length; i++ ) bytes[ i ] = bin.charCodeAt( i );
	return bytes.buffer;
}

// `source` is an ArrayBuffer. Returns { division, duration, events } where events is a
// flat, time-sorted array of { time (seconds), type: 'noteOn'|'noteOff'|'cc', channel,
// note|controller, velocity|value }.
function parseMidiFile( source ) {
	const bytes = new Uint8Array( source );
	let pos = 0;

	function readStr( n ) {
		let s = '';
		for ( let i = 0; i < n; i++ ) s += String.fromCharCode( bytes[ pos++ ] );
		return s;
	}
	function readU32() {
		const v = ( bytes[ pos ] << 24 ) | ( bytes[ pos + 1 ] << 16 ) | ( bytes[ pos + 2 ] << 8 ) | bytes[ pos + 3 ];
		pos += 4;
		return v >>> 0;
	}
	function readU16() {
		const v = ( bytes[ pos ] << 8 ) | bytes[ pos + 1 ];
		pos += 2;
		return v;
	}
	function readU8() {
		return bytes[ pos++ ];
	}
	function readVarLen() {
		let value = 0, b;
		do {
			b = readU8();
			value = ( value << 7 ) | ( b & 0x7f );
		} while ( b & 0x80 );
		return value;
	}

	readStr( 4 ); // 'MThd'
	readU32(); // header length, always 6
	readU16(); // format - not needed, we merge all tracks regardless
	const numTracks = readU16();
	const division = readU16(); // ticks per quarter note (SMPTE division formats not supported)

	const merged = [];

	for ( let t = 0; t < numTracks; t++ ) {
		readStr( 4 ); // 'MTrk'
		const trackLen = readU32();
		const trackEnd = pos + trackLen;
		let tick = 0;
		let runningStatus = null;

		while ( pos < trackEnd ) {
			tick += readVarLen();
			let statusByte = bytes[ pos ];
			if ( statusByte & 0x80 ) {
				runningStatus = statusByte;
				pos++;
			} else {
				statusByte = runningStatus;
			}
			const type = statusByte & 0xf0;
			const channel = statusByte & 0x0f;

			if ( statusByte === 0xff ) {
				const metaType = readU8();
				const len = readVarLen();
				if ( metaType === 0x51 && len === 3 ) {
					const tempo = ( bytes[ pos ] << 16 ) | ( bytes[ pos + 1 ] << 8 ) | bytes[ pos + 2 ];
					merged.push( { tick, type: 'tempo', tempo } );
				}
				pos += len;
			} else if ( statusByte === 0xf0 || statusByte === 0xf7 ) {
				pos += readVarLen();
			} else if ( type === 0x90 || type === 0x80 ) {
				const note = readU8();
				const velocity = readU8();
				const isNoteOn = type === 0x90 && velocity > 0;
				merged.push( { tick, type: isNoteOn ? 'noteOn' : 'noteOff', channel, note, velocity } );
			} else if ( type === 0xb0 ) {
				const controller = readU8();
				const value = readU8();
				merged.push( { tick, type: 'cc', channel, controller, value } );
			} else if ( type === 0xa0 || type === 0xe0 ) {
				pos += 2;
			} else if ( type === 0xc0 || type === 0xd0 ) {
				pos += 1;
			} else {
				pos += 2; // unknown status - best-effort skip
			}
		}
		pos = trackEnd;
	}

	merged.sort( ( a, b ) => a.tick - b.tick );

	let lastTick = 0, lastSeconds = 0, microsPerBeat = 500000;
	const events = [];
	merged.forEach( ( e ) => {
		lastSeconds += ( ( e.tick - lastTick ) / division ) * ( microsPerBeat / 1000000 );
		lastTick = e.tick;
		if ( e.type === 'tempo' ) {
			microsPerBeat = e.tempo;
		} else {
			events.push( Object.assign( {}, e, { time: lastSeconds } ) );
		}
	} );

	return {
		division,
		duration: events.length ? events[ events.length - 1 ].time : 0,
		events,
	};
}

export { parseMidiFile, decodeBase64DataUri };
