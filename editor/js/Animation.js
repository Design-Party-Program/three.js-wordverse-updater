import { UIPanel, UIText, UIButton, UINumber, UIRow, UISelect, UIInput, UICheckbox } from './libs/ui.js';
import {
	parseTimeline,
	createNode,
	groupTracksByTarget,
	evaluateTrack,
	evaluateRelativeTrack,
	getRelativeOp,
	combineWithBase,
	invertFromBase,
	wrapTrackTime,
	wrapMasterTime,
	readPropertyValue,
	applyPropertyValue,
	getAnimatablePropertiesForObject,
} from './SceneTimeline.js';

function Animation( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setId( 'animation' );
	container.dom.style.flexDirection = 'column';

	let panelHeight = 36;

	// Listen for resizer changes
	signals.animationPanelResized.add( function ( height ) {

		panelHeight = height;
		container.dom.style.height = height + 'px';
		signals.animationPanelChanged.dispatch( height );

	} );

	// ─── WordVerse Scene Timeline ───────────────────────────────────────────────
	// Authors arbitrary scene-object property keyframes ("tweened" or "hard set"),
	// persisted to ACF and played back by the r3f player. See SceneTimeline.js for
	// the shared data model/engine.

	// Playback controls
	const playIcon = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1.5v9l7-4.5z" fill="currentColor"/></svg>';
	const pauseIcon = '<svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor"/></svg>';
	const stopIcon = '<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" fill="currentColor"/></svg>';

	const controlsPanel = new UIPanel();
	controlsPanel.dom.style.padding = '6px 10px';
	controlsPanel.dom.style.borderBottom = '1px solid #ccc';
	controlsPanel.dom.style.display = 'flex';
	controlsPanel.dom.style.alignItems = 'center';
	controlsPanel.dom.style.justifyContent = 'center';
	controlsPanel.dom.style.gap = '6px';
	controlsPanel.dom.style.flexShrink = '0';
	container.add( controlsPanel );

	const playButton = new UIButton();
	playButton.dom.innerHTML = playIcon;
	playButton.dom.style.width = '24px';
	playButton.dom.style.height = '24px';
	playButton.dom.style.padding = '0';
	playButton.dom.style.borderRadius = '4px';
	playButton.dom.style.display = 'flex';
	playButton.dom.style.alignItems = 'center';
	playButton.dom.style.justifyContent = 'center';
	playButton.onClick( function () { startScenePlayback(); } );
	controlsPanel.add( playButton );

	const pauseButton = new UIButton();
	pauseButton.dom.innerHTML = pauseIcon;
	pauseButton.dom.style.width = '24px';
	pauseButton.dom.style.height = '24px';
	pauseButton.dom.style.padding = '0';
	pauseButton.dom.style.borderRadius = '4px';
	pauseButton.dom.style.display = 'flex';
	pauseButton.dom.style.alignItems = 'center';
	pauseButton.dom.style.justifyContent = 'center';
	pauseButton.onClick( function () { pauseScenePlayback(); } );
	controlsPanel.add( pauseButton );

	const stopButton = new UIButton();
	stopButton.dom.innerHTML = stopIcon;
	stopButton.dom.style.width = '24px';
	stopButton.dom.style.height = '24px';
	stopButton.dom.style.padding = '0';
	stopButton.dom.style.borderRadius = '4px';
	stopButton.dom.style.display = 'flex';
	stopButton.dom.style.alignItems = 'center';
	stopButton.dom.style.justifyContent = 'center';
	stopButton.onClick( function () { stopScenePlayback(); } );
	controlsPanel.add( stopButton );

	// Time display
	const timeDisplay = document.createElement( 'div' );
	timeDisplay.style.display = 'flex';
	timeDisplay.style.alignItems = 'center';
	timeDisplay.style.justifyContent = 'center';
	timeDisplay.style.gap = '4px';
	timeDisplay.style.height = '24px';
	timeDisplay.style.padding = '0 8px';
	timeDisplay.style.background = 'rgba(128,128,128,0.2)';
	timeDisplay.style.borderRadius = '4px';
	timeDisplay.style.fontFamily = 'monospace';
	timeDisplay.style.fontSize = '11px';
	controlsPanel.dom.appendChild( timeDisplay );

	const timeText = new UIText( '0.00' ).setWidth( '36px' );
	timeText.dom.style.textAlign = 'right';
	timeDisplay.appendChild( timeText.dom );

	const separator = new UIText( '/' );
	timeDisplay.appendChild( separator.dom );

	const durationText = new UIText( '0.00' ).setWidth( '36px' );
	timeDisplay.appendChild( durationText.dom );

	const sceneTimelineSection = new UIPanel();
	sceneTimelineSection.dom.style.cssText = 'flex-shrink:0;';
	container.add( sceneTimelineSection );

	const sceneTimelineHeaderRow = new UIRow();
	sceneTimelineHeaderRow.dom.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 10px;';
	sceneTimelineHeaderRow.add( new UIText( 'Scene Timeline' ).setClass( 'Label' ).setFontSize( '11px' ).setFontWeight( 'bold' ) );
	const sceneTimelineDuration = new UINumber( 10 ).setWidth( '50px' ).setRange( 0.1, 3600 ).onChange( function () {

		getTimelineData().duration = sceneTimelineDuration.getValue();
		signals.sceneTimelineChanged.dispatch();

	} );
	sceneTimelineHeaderRow.add( new UIText( 'Duration' ).setWidth( '50px' ) );
	sceneTimelineHeaderRow.add( sceneTimelineDuration );

	// Master playback flags consumed by the r3f player (ignored by the editor's own
	// preview, except Loop, which the Play button also honors for WYSIWYG parity).
	const sceneAutoplayCheckbox = new UICheckbox( false ).onChange( function () {

		getTimelineData().autoplay = sceneAutoplayCheckbox.getValue();
		signals.sceneTimelineChanged.dispatch();

	} );
	sceneTimelineHeaderRow.add( sceneAutoplayCheckbox );
	sceneTimelineHeaderRow.add( new UIText( 'Autoplay' ).setFontSize( '10px' ) );

	const sceneLoopCheckbox = new UICheckbox( false ).onChange( function () {

		getTimelineData().loop = sceneLoopCheckbox.getValue();
		signals.sceneTimelineChanged.dispatch();

	} );
	sceneTimelineHeaderRow.add( sceneLoopCheckbox );
	sceneTimelineHeaderRow.add( new UIText( 'Loop' ).setFontSize( '10px' ) );

	sceneTimelineSection.add( sceneTimelineHeaderRow );


	// Body wrapper: hosts the ruler (dedicated scrub-handle layer, always on top) and the
	// track list, sharing one coordinate space so the playhead line spans both and the
	// label gutter lines up between the ruler and every row below it.
	const sceneTimelineBody = document.createElement( 'div' );
	sceneTimelineBody.style.cssText = 'position:relative;margin:4px 10px;';
	sceneTimelineSection.dom.appendChild( sceneTimelineBody );

	let labelGutterWidth = 120;

	// Ruler: the one dedicated layer for grabbing/dragging the playhead, always drawn
	// above the track rows below it.
	const sceneTimelineRuler = document.createElement( 'div' );
	sceneTimelineRuler.style.cssText = 'position:relative;display:flex;height:20px;z-index:3;';
	sceneTimelineBody.appendChild( sceneTimelineRuler );

	const rulerGutterSpacer = document.createElement( 'div' );
	rulerGutterSpacer.style.cssText = 'flex-shrink:0;';
	sceneTimelineRuler.appendChild( rulerGutterSpacer );

	// Uses a neutral mid-grey so it stays visible in both the light and dark editor
	// themes (a black-tinted rgba disappears against the dark theme's near-black
	// background).
	const sceneTimelineRulerTrack = document.createElement( 'div' );
	sceneTimelineRulerTrack.style.cssText = 'position:relative;flex:1;height:100%;cursor:pointer;' +
		'background:rgba(128,128,128,0.25);border:1px solid rgba(128,128,128,0.4);';
	sceneTimelineRuler.appendChild( sceneTimelineRulerTrack );

	// Full-height playhead line, overlaid behind the keyframe diamonds, spanning from the
	// ruler down through every currently-visible track row.
	const sceneTimelinePlayhead = document.createElement( 'div' );
	sceneTimelinePlayhead.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:#e91e63;pointer-events:none;z-index:1;';
	sceneTimelineBody.appendChild( sceneTimelinePlayhead );

	// Drag handle between the label gutter and the timeline surface - resizes
	// labelGutterWidth, keeping the ruler and every row's label column in sync.
	const sceneTimelineGutterHandle = document.createElement( 'div' );
	sceneTimelineGutterHandle.style.cssText = 'position:absolute;top:0;bottom:0;width:6px;margin-left:-3px;cursor:ew-resize;z-index:4;';
	sceneTimelineBody.appendChild( sceneTimelineGutterHandle );

	const sceneTimelineTrackList = document.createElement( 'div' );
	sceneTimelineTrackList.style.cssText = 'position:relative;max-height:180px;overflow-y:auto;z-index:2;';
	sceneTimelineBody.appendChild( sceneTimelineTrackList );

	function layoutSceneTimelineGutter() {

		rulerGutterSpacer.style.width = labelGutterWidth + 'px';
		sceneTimelineGutterHandle.style.left = labelGutterWidth + 'px';

	}

	layoutSceneTimelineGutter();

	// Add-keyframe controls
	const sceneTimelineAddRow = new UIRow();
	sceneTimelineAddRow.dom.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 10px;';
	const scenePropertySelect = new UISelect().setWidth( '110px' );
	const sceneModeSelect = new UISelect().setWidth( '60px' ).setOptions( { set: 'Set', tween: 'Tween' } );
	const sceneEasingSelect = new UISelect().setWidth( '90px' ).setOptions( {
		linear: 'Linear', easeInQuad: 'Ease In', easeOutQuad: 'Ease Out', easeInOutQuad: 'Ease In/Out'
	} );
	sceneEasingSelect.dom.style.display = 'none';
	sceneModeSelect.onChange( function () {

		sceneEasingSelect.dom.style.display = sceneModeSelect.getValue() === 'tween' ? '' : 'none';

	} );
	const sceneAddKeyframeButton = document.createElement( 'div' );
	sceneAddKeyframeButton.title = 'Add keyframe at playhead';
	sceneAddKeyframeButton.style.cssText = 'width:10px;height:10px;flex-shrink:0;background:#4CAF50;' +
		'border:1px solid rgba(255,255,255,0.6);transform:rotate(45deg);cursor:pointer;margin:0 4px;';
	sceneAddKeyframeButton.addEventListener( 'click', addKeyframeAtPlayhead );

	sceneTimelineAddRow.add( new UIText( 'Property' ).setWidth( '50px' ) );
	sceneTimelineAddRow.add( scenePropertySelect );
	sceneTimelineAddRow.add( sceneModeSelect );
	sceneTimelineAddRow.add( sceneEasingSelect );
	sceneTimelineAddRow.dom.appendChild( sceneAddKeyframeButton );
	sceneTimelineSection.add( sceneTimelineAddRow );

	// Selected-keyframe editor. The value editor only applies to a single selection
	// (editing one value across differing properties/types is ambiguous); delete works
	// on the whole selection.
	const sceneTimelineEditRow = new UIRow();
	sceneTimelineEditRow.dom.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 10px;';
	sceneTimelineEditRow.dom.style.display = 'none';

	const sceneEditValueGroup = document.createElement( 'div' );
	sceneEditValueGroup.style.cssText = 'display:flex;align-items:center;gap:4px;';
	const sceneEditValueInput = new UIInput( '' ).setWidth( '110px' );
	sceneEditValueInput.dom.addEventListener( 'keydown', function ( event ) {

		if ( event.key === 'Enter' ) applySelectedNodeEdit();

	} );
	const sceneEditApplyButton = new UIButton( 'Apply' ).onClick( applySelectedNodeEdit );
	sceneEditValueGroup.appendChild( new UIText( 'Value' ).setWidth( '50px' ).dom );
	sceneEditValueGroup.appendChild( sceneEditValueInput.dom );
	sceneEditValueGroup.appendChild( sceneEditApplyButton.dom );
	sceneTimelineEditRow.dom.appendChild( sceneEditValueGroup );

	const sceneEditDeleteButton = new UIButton( '✕ Delete' ).onClick( deleteSelectedNodes );
	sceneEditDeleteButton.dom.title = 'Delete selected keyframe(s)';
	sceneTimelineEditRow.add( sceneEditDeleteButton );
	sceneTimelineSection.add( sceneTimelineEditRow );

	let sceneTimelineTime = 0;
	let selectedNodeIds = new Set();
	let draggingNodeId = null;
	let dragAnchorStartTime = 0;
	let dragOriginTimes = null; // Map<nodeId, time> snapshotted when a group-drag begins
	let isScenePlaying = false;
	let lastFrameTimestamp = null;
	const collapsedObjectUuids = new Set();

	// The timeline is authored on editor.scene.userData so it travels with Save/Load +
	// MQTT sceneLiveUpdate the same way wpData/groups/cameras already do.
	function getTimelineData() {

		if ( ! editor.scene.userData.timeline ) {

			editor.scene.userData.timeline = { duration: 10, nodes: [], bases: {}, loops: {}, autoplay: false, loop: false };

		}

		const timeline = editor.scene.userData.timeline;
		if ( ! timeline.bases ) timeline.bases = {};
		if ( ! timeline.loops ) timeline.loops = {};

		return timeline;

	}

	// For relative-capable properties, re-bakes every node's absolute `value` from the
	// track's current base + stored delta - keeps legacy/unaware consumers (players that
	// only ever read `value`) in sync whenever the master moves.
	function rebakeTrackValues( uuid, property ) {

		const timeline = getTimelineData();
		const key = uuid + '::' + property;
		const base = timeline.bases[ key ];
		if ( ! base ) return;

		const normalize = property.indexOf( 'rotation' ) === 0;
		timeline.nodes.forEach( ( n ) => {

			if ( n.target_uuid === uuid && n.property === property && n.delta !== undefined ) {

				n.value = combineWithBase( base.value, n.delta, base.op, normalize );

			}

		} );

	}

	// One-time migration: scenes saved before relative authoring existed have absolute
	// `value`s but no base snapshot. Capture each track's object's current (freshly
	// loaded, un-previewed) value as the master and back-derive every keyframe's delta,
	// so existing scenes keep playing back identically after upgrading.
	function migrateLegacyTimelineBases() {

		const timeline = getTimelineData();
		const tracks = groupTracksByTarget( timeline.nodes );

		tracks.forEach( ( nodes, key ) => {

			const property = nodes[ 0 ].property;
			const op = getRelativeOp( property );
			if ( ! op || timeline.bases[ key ] ) return;

			const uuid = nodes[ 0 ].target_uuid;
			const object = editor.objectByUuid( uuid );
			if ( ! object ) return;

			const baseValue = readPropertyValue( object, property );
			if ( baseValue === undefined ) return;

			timeline.bases[ key ] = { value: baseValue, op };
			nodes.forEach( ( node ) => {

				if ( node.delta === undefined ) node.delta = invertFromBase( baseValue, node.value, op );

			} );

		} );

	}

	function refreshScenePropertyOptions() {

		const object = editor.selected;
		if ( ! object ) {

			scenePropertySelect.setOptions( {} );
			sceneAddKeyframeButton.style.opacity = '0.3';
			sceneAddKeyframeButton.style.pointerEvents = 'none';
			return;

		}

		sceneAddKeyframeButton.style.opacity = '';
		sceneAddKeyframeButton.style.pointerEvents = '';
		const props = getAnimatablePropertiesForObject( object );
		const options = {};
		props.forEach( ( p ) => { options[ p ] = p; } );
		scenePropertySelect.setOptions( options );

	}

	// Shared by the global "new track" add button and each existing track row's quick-add
	// diamond button - creates/overwrites a keyframe for `uuid`::`property` at the playhead.
	function addKeyframeForTrack( uuid, property, value ) {

		if ( value === undefined ) return;

		const timeline = getTimelineData();
		const key = uuid + '::' + property;
		const op = getRelativeOp( property );
		let delta;

		if ( op ) {

			// First keyframe on this track: whatever the object currently is becomes the
			// "master" value every keyframe on this track is relative to from now on.
			if ( ! timeline.bases[ key ] ) timeline.bases[ key ] = { value, op };

			delta = invertFromBase( timeline.bases[ key ].value, value, op );

		}

		const node = createNode( {
			targetUuid: uuid,
			property,
			time: sceneTimelineTime,
			mode: sceneModeSelect.getValue(),
			value,
			delta,
			easing: sceneEasingSelect.getValue(),
		} );

		// Replace an existing node for this exact target+property+time, if any
		const existingIndex = timeline.nodes.findIndex( ( n ) =>
			n.target_uuid === node.target_uuid && n.property === node.property && n.time === node.time );
		if ( existingIndex !== - 1 ) {

			timeline.nodes.splice( existingIndex, 1, node );

		} else {

			timeline.nodes.push( node );

		}

		signals.sceneTimelineChanged.dispatch();

	}

	function addKeyframeAtPlayhead() {

		const object = editor.selected;
		if ( ! object ) return;

		const property = scenePropertySelect.getValue();
		if ( ! property ) return;

		addKeyframeForTrack( object.uuid, property, readPropertyValue( object, property ) );

	}

	function findNode( nodeId ) {

		return getTimelineData().nodes.find( ( n ) => n.id === nodeId );

	}

	function updateEditRowForSelection() {

		if ( selectedNodeIds.size === 0 ) {

			sceneTimelineEditRow.dom.style.display = 'none';
			return;

		}

		sceneTimelineEditRow.dom.style.display = '';

		if ( selectedNodeIds.size === 1 ) {

			const node = findNode( [ ...selectedNodeIds ][ 0 ] );
			sceneEditValueGroup.style.display = 'flex';
			if ( node ) sceneEditValueInput.setValue( JSON.stringify( node.value ) );
			sceneEditDeleteButton.setTextContent( '✕ Delete' );

		} else {

			sceneEditValueGroup.style.display = 'none';
			sceneEditDeleteButton.setTextContent( '✕ Delete (' + selectedNodeIds.size + ')' );

		}

	}

	function selectNode( nodeId ) {

		selectedNodeIds = new Set( [ nodeId ] );
		updateEditRowForSelection();

	}

	function toggleNodeSelection( nodeId ) {

		if ( selectedNodeIds.has( nodeId ) ) {

			selectedNodeIds.delete( nodeId );

		} else {

			selectedNodeIds.add( nodeId );

		}

		updateEditRowForSelection();

	}

	function applySelectedNodeEdit() {

		if ( selectedNodeIds.size !== 1 ) return;

		const node = findNode( [ ...selectedNodeIds ][ 0 ] );
		if ( ! node ) return;

		try {

			node.value = JSON.parse( sceneEditValueInput.getValue() );

		} catch ( err ) {

			console.warn( 'Invalid keyframe value JSON:', err );
			return;

		}

		// Editing the absolute value directly re-derives the delta against the track's
		// current master, so the keyframe keeps moving with the master afterwards.
		const timeline = getTimelineData();
		const base = timeline.bases[ node.target_uuid + '::' + node.property ];
		if ( base ) node.delta = invertFromBase( base.value, node.value, base.op );

		signals.sceneTimelineChanged.dispatch();

	}

	function deleteSelectedNodes() {

		if ( selectedNodeIds.size === 0 ) return;

		const timeline = getTimelineData();
		timeline.nodes = timeline.nodes.filter( ( n ) => ! selectedNodeIds.has( n.id ) );
		selectedNodeIds = new Set();
		sceneTimelineEditRow.dom.style.display = 'none';
		signals.sceneTimelineChanged.dispatch();

	}

	// Evaluates every track at `t` and applies it live to the viewport (scrub preview)
	function applySceneTimelinePreview( t ) {

		const timeline = getTimelineData();
		const tracks = groupTracksByTarget( timeline.nodes );

		tracks.forEach( ( nodes, key ) => {

			const separatorIndex = key.indexOf( '::' );
			const uuid = key.substring( 0, separatorIndex );
			const property = key.substring( separatorIndex + 2 );

			const trackTime = wrapTrackTime( nodes, t, !! timeline.loops[ key ] );
			const base = timeline.bases[ key ];
			const value = base
				? evaluateRelativeTrack( nodes, trackTime, base.value, base.op, property.indexOf( 'rotation' ) === 0 )
				: evaluateTrack( nodes, trackTime );
			if ( value === undefined ) return;

			const object = editor.objectByUuid( uuid );
			if ( ! object ) return;

			applyPropertyValue( object, property, value );

		} );

		signals.sceneGraphChanged.dispatch();

	}

	function updateSceneTimelinePlayheadPosition() {

		const timeline = getTimelineData();
		const rulerRect = sceneTimelineRulerTrack.getBoundingClientRect();
		const bodyRect = sceneTimelineBody.getBoundingClientRect();
		const percent = timeline.duration > 0 ? Math.min( 1, Math.max( 0, sceneTimelineTime / timeline.duration ) ) : 0;
		sceneTimelinePlayhead.style.left = ( ( rulerRect.left - bodyRect.left ) + percent * rulerRect.width ) + 'px';

	}

	function updateSceneTimeDisplay() {

		timeText.setValue( sceneTimelineTime.toFixed( 2 ) );
		durationText.setValue( getTimelineData().duration.toFixed( 2 ) );

	}

	// Advances sceneTimelineTime by real elapsed time each frame until the timeline's
	// duration is reached (playback then loops or stops, per the master Loop flag)
	function scenePlaybackTick( timestamp ) {

		if ( ! isScenePlaying ) return;

		if ( lastFrameTimestamp === null ) lastFrameTimestamp = timestamp;
		const delta = ( timestamp - lastFrameTimestamp ) / 1000;
		lastFrameTimestamp = timestamp;

		const timeline = getTimelineData();
		sceneTimelineTime += delta;

		if ( timeline.duration > 0 && sceneTimelineTime >= timeline.duration ) {

			if ( timeline.loop ) {

				sceneTimelineTime = wrapMasterTime( sceneTimelineTime, timeline.duration, true );

			} else {

				sceneTimelineTime = timeline.duration;
				isScenePlaying = false;

			}

		}

		updateSceneTimelinePlayheadPosition();
		updateSceneTimeDisplay();
		applySceneTimelinePreview( sceneTimelineTime );

		if ( isScenePlaying ) requestAnimationFrame( scenePlaybackTick );

	}

	function startScenePlayback() {

		if ( isScenePlaying ) return;

		const timeline = getTimelineData();
		if ( sceneTimelineTime >= timeline.duration ) sceneTimelineTime = 0;

		isScenePlaying = true;
		lastFrameTimestamp = null;
		requestAnimationFrame( scenePlaybackTick );

	}

	function pauseScenePlayback() {

		isScenePlaying = false;

	}

	function stopScenePlayback() {

		isScenePlaying = false;
		sceneTimelineTime = 0;
		updateSceneTimelinePlayheadPosition();
		updateSceneTimeDisplay();
		applySceneTimelinePreview( 0 );

	}

	function setSceneTimelineTimeFromClientX( clientX ) {

		const timeline = getTimelineData();
		const rect = sceneTimelineRulerTrack.getBoundingClientRect();
		const percent = Math.min( 1, Math.max( 0, ( clientX - rect.left ) / rect.width ) );
		sceneTimelineTime = percent * timeline.duration;
		updateSceneTimelinePlayheadPosition();
		updateSceneTimeDisplay();
		applySceneTimelinePreview( sceneTimelineTime );

	}

	let isScrubbingSceneTimeline = false;
	let isResizingGutter = false;

	sceneTimelineRulerTrack.addEventListener( 'mousedown', function ( event ) {

		isScenePlaying = false; // scrubbing takes over from playback
		isScrubbingSceneTimeline = true;
		setSceneTimelineTimeFromClientX( event.clientX );

	} );

	sceneTimelineGutterHandle.addEventListener( 'mousedown', function ( event ) {

		event.preventDefault();
		isResizingGutter = true;

	} );

	document.addEventListener( 'mousemove', function ( event ) {

		if ( isResizingGutter ) {

			const bodyRect = sceneTimelineBody.getBoundingClientRect();
			labelGutterWidth = Math.min( 260, Math.max( 60, event.clientX - bodyRect.left ) );
			layoutSceneTimelineGutter();
			renderSceneTimelineTracks();
			updateSceneTimelinePlayheadPosition();
			return;

		}

		if ( isScrubbingSceneTimeline ) {

			setSceneTimelineTimeFromClientX( event.clientX );

		}

		if ( draggingNodeId && dragOriginTimes ) {

			const timeline = getTimelineData();
			const rect = sceneTimelineRulerTrack.getBoundingClientRect();
			const percent = Math.min( 1, Math.max( 0, ( event.clientX - rect.left ) / rect.width ) );
			const anchorNewTime = percent * timeline.duration;
			const delta = anchorNewTime - dragAnchorStartTime;

			// Move every selected keyframe by the same delta, preserving their relative spacing
			dragOriginTimes.forEach( ( originalTime, id ) => {

				const n = findNode( id );
				if ( n ) n.time = Math.min( timeline.duration, Math.max( 0, originalTime + delta ) );

			} );

			renderSceneTimelineTracks();

		}

	} );

	document.addEventListener( 'mouseup', function () {

		isScrubbingSceneTimeline = false;
		isResizingGutter = false;

		if ( draggingNodeId ) {

			draggingNodeId = null;
			dragOriginTimes = null;
			signals.sceneTimelineChanged.dispatch();

		}

	} );

	function renderSceneTimelineTracks() {

		migrateLegacyTimelineBases();

		sceneTimelineTrackList.innerHTML = '';

		const timeline = getTimelineData();
		sceneTimelineDuration.setValue( timeline.duration );
		sceneAutoplayCheckbox.setValue( !! timeline.autoplay );
		sceneLoopCheckbox.setValue( !! timeline.loop );

		const tracks = groupTracksByTarget( timeline.nodes );

		// Nest the per-property tracks under one collapsible row per target object, so
		// multiple timelines affecting the same object are grouped together.
		const byObject = new Map(); // uuid -> [{ property, nodes, key }]
		tracks.forEach( ( nodes, key ) => {

			const separatorIndex = key.indexOf( '::' );
			const uuid = key.substring( 0, separatorIndex );
			const property = key.substring( separatorIndex + 2 );
			const list = byObject.get( uuid ) || [];
			list.push( { property, nodes, key } );
			byObject.set( uuid, list );

		} );

		byObject.forEach( ( properties, uuid ) => {

			const object = editor.objectByUuid( uuid );
			const isCollapsed = collapsedObjectUuids.has( uuid );

			const objectRow = document.createElement( 'div' );
			objectRow.style.cssText = 'display:flex;align-items:center;height:18px;font-size:10px;cursor:pointer;';

			const objectLabelArea = document.createElement( 'div' );
			objectLabelArea.style.cssText = 'display:flex;align-items:center;flex-shrink:0;width:' + labelGutterWidth + 'px;';
			objectRow.appendChild( objectLabelArea );

			const disclosure = document.createElement( 'span' );
			disclosure.textContent = isCollapsed ? '▶' : '▼';
			disclosure.style.cssText = 'width:12px;flex-shrink:0;color:#aaa;';
			objectLabelArea.appendChild( disclosure );

			const objectLabel = document.createElement( 'div' );
			objectLabel.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc;font-weight:bold;';
			objectLabel.textContent = ( object ? ( object.name || 'Object' ) : uuid.substring( 0, 8 ) ) + ' (' + properties.length + ')';
			objectLabelArea.appendChild( objectLabel );

			objectRow.addEventListener( 'click', function () {

				if ( collapsedObjectUuids.has( uuid ) ) {

					collapsedObjectUuids.delete( uuid );

				} else {

					collapsedObjectUuids.add( uuid );

				}

				renderSceneTimelineTracks();

			} );

			sceneTimelineTrackList.appendChild( objectRow );

			if ( isCollapsed ) return;

			properties.forEach( ( { property, nodes, key } ) => {

				const trackRow = document.createElement( 'div' );
				trackRow.style.cssText = 'display:flex;align-items:center;height:18px;font-size:10px;';

				const trackLabelArea = document.createElement( 'div' );
				trackLabelArea.style.cssText = 'display:flex;align-items:center;gap:3px;flex-shrink:0;' +
					'width:' + labelGutterWidth + 'px;padding-left:12px;';
				trackRow.appendChild( trackLabelArea );

				const trackLabel = document.createElement( 'div' );
				trackLabel.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#aaa;';
				trackLabel.textContent = property;
				trackLabelArea.appendChild( trackLabel );

				const trackObject = editor.objectByUuid( uuid );
				const trackValueInput = document.createElement( 'input' );
				trackValueInput.type = 'text';
				trackValueInput.title = 'Value used by the add-keyframe button';
				trackValueInput.value = JSON.stringify(
					trackObject ? readPropertyValue( trackObject, property ) : nodes[ nodes.length - 1 ].value
				);
				trackValueInput.style.cssText = 'flex-shrink:0;width:44px;font-size:9px;padding:1px;';
				trackValueInput.addEventListener( 'mousedown', ( event ) => event.stopPropagation() );
				trackLabelArea.appendChild( trackValueInput );

				const trackAddButton = document.createElement( 'div' );
				trackAddButton.title = 'Add keyframe at playhead';
				trackAddButton.style.cssText = 'width:8px;height:8px;flex-shrink:0;background:#4CAF50;' +
					'border:1px solid rgba(255,255,255,0.6);transform:rotate(45deg);cursor:pointer;';
				trackAddButton.addEventListener( 'click', function ( event ) {

					event.stopPropagation();

					let parsedValue;
					try {

						parsedValue = JSON.parse( trackValueInput.value );

					} catch ( err ) {

						console.warn( 'Invalid keyframe value JSON:', err );
						return;

					}

					addKeyframeForTrack( uuid, property, parsedValue );

				} );
				trackLabelArea.appendChild( trackAddButton );

				const loopToggle = document.createElement( 'input' );
				loopToggle.type = 'checkbox';
				loopToggle.title = 'Loop this track';
				loopToggle.checked = !! timeline.loops[ key ];
				loopToggle.style.cssText = 'flex-shrink:0;width:11px;height:11px;margin:0;';
				loopToggle.addEventListener( 'change', function () {

					timeline.loops[ key ] = loopToggle.checked;
					signals.sceneTimelineChanged.dispatch();

				} );
				trackLabelArea.appendChild( loopToggle );

				const trackTimeline = document.createElement( 'div' );
				trackTimeline.style.cssText = 'position:relative;flex:1;height:100%;background:rgba(0,0,0,0.02);';

				nodes.forEach( ( node ) => {

					const diamond = document.createElement( 'div' );
					const isSelected = selectedNodeIds.has( node.id );
					const left = timeline.duration > 0 ? ( node.time / timeline.duration ) * 100 : 0;
					diamond.style.cssText = 'position:absolute;top:50%;width:8px;height:8px;' +
						'background:' + ( node.mode === 'tween' ? '#2196F3' : '#FF9800' ) + ';' +
						'border:1px solid ' + ( isSelected ? '#fff' : 'rgba(0,0,0,0.3)' ) + ';' +
						'transform:translate(-50%,-50%) rotate(45deg);cursor:ew-resize;left:' + left + '%;';
					diamond.title = property + ' @ ' + node.time.toFixed( 2 ) + 's (' + node.mode + ')';

					diamond.addEventListener( 'mousedown', function ( event ) {

						event.stopPropagation();

						if ( event.shiftKey ) {

							toggleNodeSelection( node.id );

						} else if ( ! selectedNodeIds.has( node.id ) ) {

							selectNode( node.id );

						}

						if ( selectedNodeIds.has( node.id ) ) {

							// Snapshot every selected keyframe's time so the whole selection
							// drags together, preserving relative spacing
							draggingNodeId = node.id;
							dragAnchorStartTime = node.time;
							dragOriginTimes = new Map();
							selectedNodeIds.forEach( ( id ) => {

								const n = findNode( id );
								if ( n ) dragOriginTimes.set( id, n.time );

							} );

						}

						renderSceneTimelineTracks();

					} );

					trackTimeline.appendChild( diamond );

				} );

				trackRow.appendChild( trackTimeline );
				sceneTimelineTrackList.appendChild( trackRow );

			} );

		} );

	}

	function loadSceneTimeline() {

		// Normalize whatever is currently on userData (freshly loaded from ACF JSON,
		// or absent for a brand-new scene) into the {duration, nodes, bases, loops,
		// autoplay, loop} shape.
		const existing = editor.scene.userData.timeline;
		editor.scene.userData.timeline = ( existing && Array.isArray( existing.nodes ) )
			? existing
			: { duration: 10, nodes: [], bases: {}, loops: {}, autoplay: false, loop: false };

		isScenePlaying = false;
		sceneTimelineTime = 0;
		selectedNodeIds = new Set();
		sceneTimelineEditRow.dom.style.display = 'none';
		renderSceneTimelineTracks();
		updateSceneTimelinePlayheadPosition();
		updateSceneTimeDisplay();

	}

	signals.sceneTimelineChanged.add( renderSceneTimelineTracks );
	signals.sceneTimelineChanged.add( updateSceneTimeDisplay );
	signals.objectSelected.add( refreshScenePropertyOptions );
	signals.editorCleared.add( loadSceneTimeline );

	// Keyframes track the object's master value, not a frozen absolute number: whenever
	// the object is moved/recolored/etc. through the normal editor UI (Sidebar, transform
	// gizmo), shift the relevant tracks' bases to match, carrying every keyframe along
	// with it. Ignored while scrubbing/playing, since the live values shown then are
	// evaluated preview output, not the master.
	signals.objectChanged.add( function ( object ) {

		if ( ! object || isScrubbingSceneTimeline || isScenePlaying ) return;

		const timeline = getTimelineData();
		let changed = false;

		Object.keys( timeline.bases ).forEach( ( key ) => {

			const separatorIndex = key.indexOf( '::' );
			const uuid = key.substring( 0, separatorIndex );
			if ( uuid !== object.uuid ) return;

			const property = key.substring( separatorIndex + 2 );
			const newBaseValue = readPropertyValue( object, property );
			if ( newBaseValue === undefined ) return;

			timeline.bases[ key ].value = newBaseValue;
			rebakeTrackValues( uuid, property );
			changed = true;

		} );

		if ( changed ) signals.sceneTimelineChanged.dispatch();

	} );

	loadSceneTimeline();

	// Show panel on initial load
	container.setDisplay( 'flex' );
	container.dom.style.height = panelHeight + 'px';
	signals.animationPanelChanged.dispatch( panelHeight );

	return container;

}

export { Animation };
