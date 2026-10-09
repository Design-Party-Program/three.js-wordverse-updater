import * as THREE from 'three';

import { UIPanel, UIRow, UIInput, UIButton, UIColor, UICheckbox, UIInteger, UITextArea, UIText, UINumber, UISelect } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';

import { SetUuidCommand } from './commands/SetUuidCommand.js';
import { SetValueCommand } from './commands/SetValueCommand.js';
import { SetPositionCommand } from './commands/SetPositionCommand.js';
import { SetRotationCommand } from './commands/SetRotationCommand.js';
import { SetScaleCommand } from './commands/SetScaleCommand.js';
import { SetColorCommand } from './commands/SetColorCommand.js';
import { SetShadowValueCommand } from './commands/SetShadowValueCommand.js';

function SidebarObject( editor ) {

	const strings = editor.strings;

	const signals = editor.signals;

	const container = new UIPanel();
	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );
	container.setDisplay( 'none' );

	// Actions

	/*
	let objectActions = new UI.Select().setPosition( 'absolute' ).setRight( '8px' ).setFontSize( '11px' );
	objectActions.setOptions( {

		'Actions': 'Actions',
		'Reset Position': 'Reset Position',
		'Reset Rotation': 'Reset Rotation',
		'Reset Scale': 'Reset Scale'

	} );
	objectActions.onClick( function ( event ) {

		event.stopPropagation(); // Avoid panel collapsing

	} );
	objectActions.onChange( function ( event ) {

		let object = editor.selected;

		switch ( this.getValue() ) {

			case 'Reset Position':
				editor.execute( new SetPositionCommand( editor, object, new Vector3( 0, 0, 0 ) ) );
				break;

			case 'Reset Rotation':
				editor.execute( new SetRotationCommand( editor, object, new Euler( 0, 0, 0 ) ) );
				break;

			case 'Reset Scale':
				editor.execute( new SetScaleCommand( editor, object, new Vector3( 1, 1, 1 ) ) );
				break;

		}

		this.setValue( 'Actions' );

	} );
	container.addStatic( objectActions );
	*/


	// name

	const objectNameRow = new UIRow();
	const objectName = new UIInput().setWidth( '150px' ).setFontSize( '12px' ).onChange( function () {

		editor.execute( new SetValueCommand( editor, editor.selected, 'name', objectName.getValue() ) );

	} );

	objectNameRow.add( new UIText( strings.getKey( 'sidebar/object/name' ) ).setWidth( '90px' ) );
	objectNameRow.add( objectName );

	container.add( objectNameRow );

	// type

	const objectTypeRow = new UIRow();
	const objectType = new UIText();

	objectTypeRow.add( new UIText( strings.getKey( 'sidebar/object/type' ) ).setClass( 'Label' ) );
	objectTypeRow.add( objectType );

	container.add( objectTypeRow );

	// uuid

	const objectUUIDRow = new UIRow();
	const objectUUID = new UIInput().setWidth( '102px' ).setFontSize( '12px' ).setDisabled( true );
	const objectUUIDRenew = new UIButton( strings.getKey( 'sidebar/object/new' ) ).setMarginLeft( '7px' ).onClick( function () {

		objectUUID.setValue( THREE.MathUtils.generateUUID() );

		editor.execute( new SetUuidCommand( editor, editor.selected, objectUUID.getValue() ) );

	} );

	objectUUIDRow.add( new UIText( strings.getKey( 'sidebar/object/uuid' ) ).setClass( 'Label' ) );
	objectUUIDRow.add( objectUUID );
	objectUUIDRow.add( objectUUIDRenew );

	container.add( objectUUIDRow );

	// position

	const objectPositionRow = new UIRow();
	const objectPositionX = new UINumber().setPrecision( 3 ).setWidth( '50px' ).onChange( update );
	const objectPositionY = new UINumber().setPrecision( 3 ).setWidth( '50px' ).onChange( update );
	const objectPositionZ = new UINumber().setPrecision( 3 ).setWidth( '50px' ).onChange( update );

	objectPositionRow.add( new UIText( strings.getKey( 'sidebar/object/position' ) ).setClass( 'Label' ) );
	objectPositionRow.add( objectPositionX, objectPositionY, objectPositionZ );

	container.add( objectPositionRow );

	// rotation

	const objectRotationRow = new UIRow();
	const objectRotationX = new UINumber().setStep( 10 ).setNudge( 0.1 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );
	const objectRotationY = new UINumber().setStep( 10 ).setNudge( 0.1 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );
	const objectRotationZ = new UINumber().setStep( 10 ).setNudge( 0.1 ).setUnit( '°' ).setWidth( '50px' ).onChange( update );

	objectRotationRow.add( new UIText( strings.getKey( 'sidebar/object/rotation' ) ).setClass( 'Label' ) );
	objectRotationRow.add( objectRotationX, objectRotationY, objectRotationZ );

	container.add( objectRotationRow );

	// scale

	const objectScaleRow = new UIRow();
	const objectScaleX = new UINumber( 1 ).setPrecision( 3 ).setWidth( '50px' ).onChange( update );
	const objectScaleY = new UINumber( 1 ).setPrecision( 3 ).setWidth( '50px' ).onChange( update );
	const objectScaleZ = new UINumber( 1 ).setPrecision( 3 ).setWidth( '50px' ).onChange( update );

	objectScaleRow.add( new UIText( strings.getKey( 'sidebar/object/scale' ) ).setClass( 'Label' ) );
	objectScaleRow.add( objectScaleX, objectScaleY, objectScaleZ );

	container.add( objectScaleRow );

	// fov

	const objectFovRow = new UIRow();
	const objectFov = new UINumber().onChange( update );

	objectFovRow.add( new UIText( strings.getKey( 'sidebar/object/fov' ) ).setClass( 'Label' ) );
	objectFovRow.add( objectFov );

	container.add( objectFovRow );

	// left

	const objectLeftRow = new UIRow();
	const objectLeft = new UINumber().onChange( update );

	objectLeftRow.add( new UIText( strings.getKey( 'sidebar/object/left' ) ).setClass( 'Label' ) );
	objectLeftRow.add( objectLeft );

	container.add( objectLeftRow );

	// right

	const objectRightRow = new UIRow();
	const objectRight = new UINumber().onChange( update );

	objectRightRow.add( new UIText( strings.getKey( 'sidebar/object/right' ) ).setClass( 'Label' ) );
	objectRightRow.add( objectRight );

	container.add( objectRightRow );

	// top

	const objectTopRow = new UIRow();
	const objectTop = new UINumber().onChange( update );

	objectTopRow.add( new UIText( strings.getKey( 'sidebar/object/top' ) ).setClass( 'Label' ) );
	objectTopRow.add( objectTop );

	container.add( objectTopRow );

	// bottom

	const objectBottomRow = new UIRow();
	const objectBottom = new UINumber().onChange( update );

	objectBottomRow.add( new UIText( strings.getKey( 'sidebar/object/bottom' ) ).setClass( 'Label' ) );
	objectBottomRow.add( objectBottom );

	container.add( objectBottomRow );

	// near

	const objectNearRow = new UIRow();
	const objectNear = new UINumber().onChange( update );

	objectNearRow.add( new UIText( strings.getKey( 'sidebar/object/near' ) ).setClass( 'Label' ) );
	objectNearRow.add( objectNear );

	container.add( objectNearRow );

	// far

	const objectFarRow = new UIRow();
	const objectFar = new UINumber().onChange( update );

	objectFarRow.add( new UIText( strings.getKey( 'sidebar/object/far' ) ).setClass( 'Label' ) );
	objectFarRow.add( objectFar );

	container.add( objectFarRow );

	// intensity

	const objectIntensityRow = new UIRow();
	const objectIntensity = new UINumber().onChange( update );

	objectIntensityRow.add( new UIText( strings.getKey( 'sidebar/object/intensity' ) ).setClass( 'Label' ) );
	objectIntensityRow.add( objectIntensity );

	container.add( objectIntensityRow );

	// color

	const objectColorRow = new UIRow();
	const objectColor = new UIColor().onInput( update );

	objectColorRow.add( new UIText( strings.getKey( 'sidebar/object/color' ) ).setClass( 'Label' ) );
	objectColorRow.add( objectColor );

	container.add( objectColorRow );

	// ground color

	const objectGroundColorRow = new UIRow();
	const objectGroundColor = new UIColor().onInput( update );

	objectGroundColorRow.add( new UIText( strings.getKey( 'sidebar/object/groundcolor' ) ).setClass( 'Label' ) );
	objectGroundColorRow.add( objectGroundColor );

	container.add( objectGroundColorRow );

	// distance

	const objectDistanceRow = new UIRow();
	const objectDistance = new UINumber().setRange( 0, Infinity ).onChange( update );

	objectDistanceRow.add( new UIText( strings.getKey( 'sidebar/object/distance' ) ).setClass( 'Label' ) );
	objectDistanceRow.add( objectDistance );

	container.add( objectDistanceRow );

	// angle

	const objectAngleRow = new UIRow();
	const objectAngle = new UINumber().setPrecision( 3 ).setRange( 0, Math.PI / 2 ).onChange( update );

	objectAngleRow.add( new UIText( strings.getKey( 'sidebar/object/angle' ) ).setClass( 'Label' ) );
	objectAngleRow.add( objectAngle );

	container.add( objectAngleRow );

	// penumbra

	const objectPenumbraRow = new UIRow();
	const objectPenumbra = new UINumber().setRange( 0, 1 ).onChange( update );

	objectPenumbraRow.add( new UIText( strings.getKey( 'sidebar/object/penumbra' ) ).setClass( 'Label' ) );
	objectPenumbraRow.add( objectPenumbra );

	container.add( objectPenumbraRow );

	// decay

	const objectDecayRow = new UIRow();
	const objectDecay = new UINumber().setRange( 0, Infinity ).onChange( update );

	objectDecayRow.add( new UIText( strings.getKey( 'sidebar/object/decay' ) ).setClass( 'Label' ) );
	objectDecayRow.add( objectDecay );

	container.add( objectDecayRow );

	// shadow

	const objectShadowRow = new UIRow();

	objectShadowRow.add( new UIText( strings.getKey( 'sidebar/object/shadow' ) ).setClass( 'Label' ) );

	const objectCastShadow = new UIBoolean( false, strings.getKey( 'sidebar/object/cast' ) ).onChange( update );
	objectShadowRow.add( objectCastShadow );

	const objectReceiveShadow = new UIBoolean( false, strings.getKey( 'sidebar/object/receive' ) ).onChange( update );
	objectShadowRow.add( objectReceiveShadow );

	container.add( objectShadowRow );

	// shadow intensity

	const objectShadowIntensityRow = new UIRow();

	objectShadowIntensityRow.add( new UIText( strings.getKey( 'sidebar/object/shadowIntensity' ) ).setClass( 'Label' ) );

	const objectShadowIntensity = new UINumber( 0 ).setRange( 0, 1 ).onChange( update );
	objectShadowIntensityRow.add( objectShadowIntensity );

	container.add( objectShadowIntensityRow );

	// shadow bias

	const objectShadowBiasRow = new UIRow();

	objectShadowBiasRow.add( new UIText( strings.getKey( 'sidebar/object/shadowBias' ) ).setClass( 'Label' ) );

	const objectShadowBias = new UINumber( 0 ).setPrecision( 5 ).setStep( 0.0001 ).setNudge( 0.00001 ).onChange( update );
	objectShadowBiasRow.add( objectShadowBias );

	container.add( objectShadowBiasRow );

	// shadow normal offset

	const objectShadowNormalBiasRow = new UIRow();

	objectShadowNormalBiasRow.add( new UIText( strings.getKey( 'sidebar/object/shadowNormalBias' ) ).setClass( 'Label' ) );

	const objectShadowNormalBias = new UINumber( 0 ).onChange( update );
	objectShadowNormalBiasRow.add( objectShadowNormalBias );

	container.add( objectShadowNormalBiasRow );

	// shadow radius

	const objectShadowRadiusRow = new UIRow();

	objectShadowRadiusRow.add( new UIText( strings.getKey( 'sidebar/object/shadowRadius' ) ).setClass( 'Label' ) );

	const objectShadowRadius = new UINumber( 1 ).onChange( update );
	objectShadowRadiusRow.add( objectShadowRadius );

	container.add( objectShadowRadiusRow );

	// visible

	const objectVisibleRow = new UIRow();
	const objectVisible = new UICheckbox().onChange( update );

	objectVisibleRow.add( new UIText( strings.getKey( 'sidebar/object/visible' ) ).setClass( 'Label' ) );
	objectVisibleRow.add( objectVisible );

	container.add( objectVisibleRow );

	// frustumCulled

	const objectFrustumCulledRow = new UIRow();
	const objectFrustumCulled = new UICheckbox().onChange( update );

	objectFrustumCulledRow.add( new UIText( strings.getKey( 'sidebar/object/frustumcull' ) ).setClass( 'Label' ) );
	objectFrustumCulledRow.add( objectFrustumCulled );

	container.add( objectFrustumCulledRow );

	// renderOrder

	const objectRenderOrderRow = new UIRow();
	const objectRenderOrder = new UIInteger().setWidth( '50px' ).onChange( update );

	objectRenderOrderRow.add( new UIText( strings.getKey( 'sidebar/object/renderorder' ) ).setClass( 'Label' ) );
	objectRenderOrderRow.add( objectRenderOrder );

	container.add( objectRenderOrderRow );

	// user data

	const objectUserDataRow = new UIRow();
	const objectUserData = new UITextArea().setWidth( '150px' ).setHeight( '40px' ).setFontSize( '12px' ).onChange( update );
	objectUserData.onKeyUp( function () {

		try {

			JSON.parse( objectUserData.getValue() );

			objectUserData.dom.classList.add( 'success' );
			objectUserData.dom.classList.remove( 'fail' );

		} catch ( error ) {

			objectUserData.dom.classList.remove( 'success' );
			objectUserData.dom.classList.add( 'fail' );

		}

	} );

	objectUserDataRow.add( new UIText( strings.getKey( 'sidebar/object/userdata' ) ).setClass( 'Label' ) );
	objectUserDataRow.add( objectUserData );

	container.add( objectUserDataRow );

	// ─── WordVerse Texture ─────────────────────────────────────────────────────

	const objectWvSectionRow = new UIRow();
	objectWvSectionRow.dom.style.cssText = 'border-top:1px solid #555;margin-top:8px;padding-top:6px;';
	objectWvSectionRow.add( new UIText( 'Texture' ).setWidth( '90px' ).setFontSize( '11px' ).setColor( '#aaa' ) );
	container.add( objectWvSectionRow );

	// Image thumbnail preview (hidden until an image is selected)
	const objectImageTexPreviewRow = new UIRow();
	const objectImageTexPreviewImg = document.createElement( 'img' );
	objectImageTexPreviewImg.style.cssText =
		'width:150px;height:auto;max-height:90px;object-fit:contain;' +
		'border:1px solid #555;display:none;margin-left:4px;';
	objectImageTexPreviewRow.dom.appendChild( objectImageTexPreviewImg );
	container.add( objectImageTexPreviewRow );

	// Image-pick button + clear button
	const objectImageTexRow = new UIRow();
	const objectImageTexPick = new UIButton( 'Pick Image' ).setMarginRight( '4px' ).onClick( function () {
		try {
			var frame = parent.wp.media( {
				title: 'Select Image Texture',
				button: { text: 'Use this image' },
				multiple: false,
				library: { type: 'image' }
			} );
			frame.on( 'select', function () {
				const att = frame.state().get( 'selection' ).first().toJSON();
				_applyImageTexture( editor.selected, att.id, att.url );
			} );
			frame.open();
		} catch ( e ) {
			console.warn( 'WP media picker unavailable:', e );
		}
	} );
	const objectImageTexClear = new UIButton( '✕' ).onClick( function () {
		_applyImageTexture( editor.selected, null, null );
	} );
	objectImageTexClear.dom.title = 'Remove image texture';
	objectImageTexRow.add( new UIText( 'Image' ).setWidth( '90px' ) );
	objectImageTexRow.add( objectImageTexPick );
	objectImageTexRow.add( objectImageTexClear );
	container.add( objectImageTexRow );

	// Hydra script textarea
	// Video-pick button + clear button (auto-generates Hydra script)
	const objectVideoTexRow = new UIRow();
	const objectVideoTexPick = new UIButton( 'Pick Video' ).setMarginRight( '4px' ).onClick( function () {
		try {
			var frame = parent.wp.media( {
				title: 'Select Video Texture',
				button: { text: 'Use this video' },
				multiple: false,
				library: { type: 'video' }
			} );
			frame.on( 'select', function () {
				const att = frame.state().get( 'selection' ).first().toJSON();
				_applyVideoTexture( editor.selected, att.url );
			} );
			frame.open();
		} catch ( e ) {
			console.warn( 'WP media picker unavailable:', e );
		}
	} );
	const objectVideoTexClear = new UIButton( '✕' ).onClick( function () {
		_applyVideoTexture( editor.selected, null );
	} );
	objectVideoTexClear.dom.title = 'Remove video texture';
	objectVideoTexRow.add( new UIText( 'Video' ).setWidth( '90px' ) );
	objectVideoTexRow.add( objectVideoTexPick );
	objectVideoTexRow.add( objectVideoTexClear );
	container.add( objectVideoTexRow );

	// Label showing the filename of the currently assigned video
	const objectVideoTexLabelRow = new UIRow();
	objectVideoTexLabelRow.dom.style.cssText = 'padding-left:94px;';
	const objectVideoTexLabel = new UIText( '' ).setFontSize( '11px' ).setColor( '#aaa' );
	objectVideoTexLabel.dom.style.wordBreak = 'break-all';
	objectVideoTexLabelRow.add( objectVideoTexLabel );
	container.add( objectVideoTexLabelRow );

	// Color swatch + apply/clear buttons
	const objectColorTexRow = new UIRow();
	const objectColorTexPicker = new UIColor().setValue( '#ffffff' );
	const objectColorTexApply = new UIButton( 'Apply Color' ).setMarginLeft( '4px' ).onClick( function () {
		_applyColorTexture( editor.selected, objectColorTexPicker.getValue() );
	} );
	const objectColorTexClear = new UIButton( '✕' ).onClick( function () {
		_applyColorTexture( editor.selected, null );
	} );
	objectColorTexClear.dom.title = 'Remove color texture';
	objectColorTexRow.add( new UIText( 'Color' ).setWidth( '90px' ) );
	objectColorTexRow.add( objectColorTexPicker );
	objectColorTexRow.add( objectColorTexApply );
	objectColorTexRow.add( objectColorTexClear );
	container.add( objectColorTexRow );

	// Scene-as-texture: render another vr-scenes post from its default camera as
	// a live texture (r3f player only — the editor just shows a text placeholder)
	const objectSceneTexSearchRow = new UIRow();
	const objectSceneTexSearchInput = new UIInput( '' ).setWidth( '110px' );
	const objectSceneTexSearchButton = new UIButton( 'Search' ).setMarginLeft( '4px' ).onClick( function () {
		_searchScenes( objectSceneTexSearchInput.getValue() );
	} );
	objectSceneTexSearchRow.add( new UIText( 'Scene Tex' ).setWidth( '90px' ) );
	objectSceneTexSearchRow.add( objectSceneTexSearchInput );
	objectSceneTexSearchRow.add( objectSceneTexSearchButton );
	container.add( objectSceneTexSearchRow );

	const objectSceneTexResultsRow = new UIRow();
	const objectSceneTexResultsSelect = new UISelect().setWidth( '110px' );
	const objectSceneTexAssign = new UIButton( 'Assign' ).setMarginLeft( '4px' ).onClick( function () {
		const id = objectSceneTexResultsSelect.getValue();
		if ( ! id ) return;
		const option = objectSceneTexResultsSelect.dom.options[ objectSceneTexResultsSelect.dom.selectedIndex ];
		_applySceneTexture( editor.selected, parseInt( id, 10 ), option ? option.text : '' );
	} );
	const objectSceneTexClear = new UIButton( '✕' ).onClick( function () {
		_applySceneTexture( editor.selected, null, null );
	} );
	objectSceneTexClear.dom.title = 'Remove scene texture';
	objectSceneTexResultsRow.add( new UIText( '' ).setWidth( '90px' ) );
	objectSceneTexResultsRow.add( objectSceneTexResultsSelect );
	objectSceneTexResultsRow.add( objectSceneTexAssign );
	objectSceneTexResultsRow.add( objectSceneTexClear );
	container.add( objectSceneTexResultsRow );

	const objectSceneTexLabelRow = new UIRow();
	objectSceneTexLabelRow.dom.style.cssText = 'padding-left:94px;';
	const objectSceneTexLabel = new UIText( '' ).setFontSize( '11px' ).setColor( '#aaa' );
	objectSceneTexLabelRow.add( objectSceneTexLabel );
	container.add( objectSceneTexLabelRow );

	// Default camera toggle (only shown for camera objects)
	const objectDefaultCameraRow = new UIRow();
	const objectDefaultCameraCheckbox = new UICheckbox( false ).onChange( function () {
		_setDefaultCamera( editor.selected, objectDefaultCameraCheckbox.getValue() );
	} );
	objectDefaultCameraRow.add( new UIText( 'Default Camera' ).setClass( 'Label' ) );
	objectDefaultCameraRow.add( objectDefaultCameraCheckbox );
	container.add( objectDefaultCameraRow );

	const objectHydraScriptRow = new UIRow();
	const objectHydraScript = new UITextArea().setWidth( '150px' ).setHeight( '72px' ).setFontSize( '11px' );
	objectHydraScript.dom.style.fontFamily = 'monospace';
	objectHydraScript.dom.placeholder = 'Hydra JS — e.g.\nosc(4,0.1,0).out(o0)';
	objectHydraScriptRow.add( new UIText( 'Hydra' ).setWidth( '90px' ) );
	objectHydraScriptRow.add( objectHydraScript );
	container.add( objectHydraScriptRow );

	const objectHydraApplyRow = new UIRow();
	const objectHydraApply = new UIButton( 'Apply Hydra' ).onClick( function () {
		const code = objectHydraScript.getValue().trim();
		if ( code ) _applyHydraTexture( editor.selected, code );
	} );
	objectHydraApplyRow.add( new UIText( '' ).setWidth( '90px' ) );
	objectHydraApplyRow.add( objectHydraApply );
	container.add( objectHydraApplyRow );

	// ── helper: mark a camera as the scene's default (only one at a time) ────
	function _setDefaultCamera( object, isDefault ) {
		if ( ! object || ! object.isCamera ) return;
		if ( isDefault ) {
			editor.scene.traverse( function ( node ) {
				if ( node.isCamera && node !== object ) node.userData.wvIsDefaultCamera = false;
			} );
		}
		object.userData.wvIsDefaultCamera = !! isDefault;
		editor.sendMqtt( 'setDefaultCamera', { uuid: object.uuid, isDefault: !! isDefault } );
		editor.signals.sceneGraphChanged.dispatch();
	}

	// ── helper: search vr-scenes posts by title for the scene-texture picker ──
	function _searchScenes( query ) {
		fetch( '/wp-json/wp/v2/vr-scenes?search=' + encodeURIComponent( query || '' ) + '&per_page=10' )
			.then( function ( r ) { return r.json(); } )
			.then( function ( results ) {
				const options = {};
				( results || [] ).forEach( function ( scene ) {
					options[ scene.id ] = scene.title && scene.title.rendered ? scene.title.rendered : ( 'Scene #' + scene.id );
				} );
				objectSceneTexResultsSelect.setOptions( options );
			} )
			.catch( function ( e ) { console.warn( 'Scene search failed:', e ); } );
	}

	// ── helper: assign/clear another vr-scenes post as a live portal texture ──
	// The editor only shows a text placeholder; the r3f player does the real
	// off-screen render from that scene's default camera.
	function _applySceneTexture( object, sceneId, sceneTitle ) {
		if ( ! object ) return;
		const root = _resolveTextureRoot( object );
		if ( ! sceneId ) {
			root.userData.sceneTexture = '';
			root.userData.sceneTextureTitle = '';
			objectSceneTexLabel.setValue( '' );
			editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: '', texture: '', videoTexture: '', colorTexture: '', sceneTexture: '' } );
			return;
		}
		root.userData.sceneTexture = sceneId;
		root.userData.sceneTextureTitle = sceneTitle || ( 'Scene #' + sceneId );
		root.userData.imageTexture = '';
		root.userData.texture = '';
		root.userData.videoTexture = '';
		root.userData.colorTexture = '';
		objectImageTexPreviewImg.style.display = 'none';
		objectImageTexPreviewImg.src = '';
		objectVideoTexLabel.setValue( '' );
		objectHydraScript.setValue( '' );
		objectColorTexPicker.setValue( '#ffffff' );
		objectSceneTexLabel.setValue( root.userData.sceneTextureTitle );
		editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: '', texture: '', videoTexture: '', colorTexture: '', sceneTexture: sceneId } );
		_paintSceneTexturePlaceholder( object, root.userData.sceneTextureTitle );
	}

	// ── helper: render a simple "Portal: <name>" label onto a canvas texture ──
	function _paintSceneTexturePlaceholder( object, label ) {
		var canvas = document.createElement( 'canvas' );
		canvas.width = 512;
		canvas.height = 512;
		var ctx = canvas.getContext( '2d' );
		ctx.fillStyle = '#202030';
		ctx.fillRect( 0, 0, canvas.width, canvas.height );
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 36px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText( 'PORTAL', canvas.width / 2, canvas.height / 2 - 20 );
		ctx.font = '24px sans-serif';
		ctx.fillText( label || '', canvas.width / 2, canvas.height / 2 + 24 );
		var tex = new THREE.CanvasTexture( canvas );
		tex.needsUpdate = true;
		object.traverse( function ( child ) {
			if ( child.isMesh ) {
				var mats = Array.isArray( child.material ) ? child.material : [ child.material ];
				mats.forEach( function ( mat ) {
					var m = mat.clone();
					m.map = tex;
					m.color.set( '#ffffff' );
					m.needsUpdate = true;
					child.material = m;
				} );
			}
		} );
		editor.signals.sceneGraphChanged.dispatch();
	}

	// ── helper: walk up to the wpData-bearing ancestor (the node persisted in save) ──
	function _resolveTextureRoot( object ) {
		let node = object;
		while ( node && ! ( node.userData && node.userData.wpData ) && node.parent && node.parent.type !== 'Scene' ) {
			node = node.parent;
		}
		return node || object;
	}

	// ── helper: apply a WP-media-backed image texture live ───────────────────
	function _applyImageTexture( object, mediaId, imageUrl ) {
		if ( ! object ) return;
		const root = _resolveTextureRoot( object );
		// Clear state
		objectImageTexPreviewImg.style.display = 'none';
		objectImageTexPreviewImg.src = '';
		if ( ! mediaId || ! imageUrl ) {
			root.userData.imageTexture = '';
			root.userData.videoTexture = '';
			objectVideoTexLabel.setValue( '' );
			return;
		}
		root.userData.imageTexture = mediaId;
		root.userData.texture = '';
		root.userData.videoTexture = '';
		root.userData.colorTexture = '';
		root.userData.sceneTexture = '';
		objectHydraScript.setValue( '' );
		objectVideoTexLabel.setValue( '' );
		objectColorTexPicker.setValue( '#ffffff' );
		objectSceneTexLabel.setValue( '' );
		objectImageTexPreviewImg.src = imageUrl;
		objectImageTexPreviewImg.style.display = 'block';
		editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: mediaId, texture: '', videoTexture: '', colorTexture: '', sceneTexture: '' } );
		var img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = function () {
			var canvas = document.createElement( 'canvas' );
			var ctx = canvas.getContext( '2d' );
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.scale( 1, -1 );
			ctx.translate( 0, -img.height );
			ctx.drawImage( img, 0, 0 );
			var tex = new THREE.CanvasTexture( canvas );
			tex.needsUpdate = true;
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					var mats = Array.isArray( child.material ) ? child.material : [ child.material ];
					mats.forEach( function ( mat ) {
						var m = mat.clone();
						m.map = tex;
						m.needsUpdate = true;
						child.material = m;
					} );
				}
			} );
			editor.signals.sceneGraphChanged.dispatch();
		};
		img.src = imageUrl;
	}

	// ── helper: pick a WP video and auto-generate Hydra script ──────────────
	function _applyVideoTexture( object, videoUrl ) {
		if ( ! object ) return;
		const root = _resolveTextureRoot( object );
		objectVideoTexLabel.setValue( '' );
		if ( ! videoUrl ) {
			root.userData.videoTexture = '';
			return;
		}
		root.userData.videoTexture = videoUrl;
		objectVideoTexLabel.setValue( videoUrl.split( '/' ).pop() );
		var code =
			's0.initVideo("' + videoUrl + '")\n' +
			'src(s0).rotate(Math.PI).out(o0)';
		objectHydraScript.setValue( code );
		_applyHydraTexture( object, code, videoUrl );
	}

	// ── helper: apply a flat color as the material (clears image/video/hydra) ──
	function _applyColorTexture( object, hexColor ) {
		if ( ! object ) return;
		const root = _resolveTextureRoot( object );
		if ( ! hexColor ) {
			root.userData.colorTexture = '';
			editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: '', texture: '', videoTexture: '', colorTexture: '', sceneTexture: '' } );
			return;
		}
		root.userData.colorTexture = hexColor;
		root.userData.imageTexture = '';
		root.userData.texture = '';
		root.userData.videoTexture = '';
		root.userData.sceneTexture = '';
		objectImageTexPreviewImg.style.display = 'none';
		objectImageTexPreviewImg.src = '';
		objectVideoTexLabel.setValue( '' );
		objectHydraScript.setValue( '' );
		objectColorTexPicker.setValue( hexColor );
		objectSceneTexLabel.setValue( '' );
		editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: '', texture: '', videoTexture: '', colorTexture: hexColor, sceneTexture: '' } );
		object.traverse( function ( child ) {
			if ( child.isMesh ) {
				var mats = Array.isArray( child.material ) ? child.material : [ child.material ];
				mats.forEach( function ( mat ) {
					var m = mat.clone();
					m.map = null;
					m.color.set( hexColor );
					m.needsUpdate = true;
					child.material = m;
				} );
			}
		} );
		editor.signals.sceneGraphChanged.dispatch();
	}

	// ── helper: bootstrap Hydra and apply a code string live ─────────────────
	function _extractVideoFromHydra( code ) {
		if ( ! code ) return null;
		var m = code.match( /initVideo\(\s*["']([^"']+)["']\s*\)/ );
		return m ? m[ 1 ] : null;
	}

	function _applyHydraTexture( object, code, videoUrl ) {
		if ( ! object || ! code ) return;
		const root = _resolveTextureRoot( object );
		root.userData.texture = code;
		root.userData.imageTexture = '';
		root.userData.colorTexture = '';
		root.userData.sceneTexture = '';
		objectColorTexPicker.setValue( '#ffffff' );
		objectSceneTexLabel.setValue( '' );
		// If no explicit videoUrl was provided, try to extract it from the hydra code
		var resolvedVideoUrl = videoUrl || _extractVideoFromHydra( code );
		if ( resolvedVideoUrl ) {
			root.userData.videoTexture = resolvedVideoUrl;
			objectVideoTexLabel.setValue( resolvedVideoUrl.split( '/' ).pop() );
		} else {
			root.userData.videoTexture = '';
			objectVideoTexLabel.setValue( '' );
		}
		objectImageTexPreviewImg.style.display = 'none';
		editor.sendMqtt( 'setObjectTexture', { uuid: object.uuid, imageTexture: '', texture: code, videoTexture: resolvedVideoUrl || '', colorTexture: '', sceneTexture: '' } );
		( async function () {
			try {
				var hydraCanvas = document.createElement( 'canvas' );
				hydraCanvas.width = 1024;
				hydraCanvas.height = 1024;
				hydraCanvas.style.cssText =
					'position:absolute;right:-2048px;bottom:0;z-index:-1;pointer-events:none;';
				document.body.appendChild( hydraCanvas );
				if ( ! window.Hydra ) {
					if ( ! window._hydraSynthLoading ) {
						window._hydraSynthLoading = new Promise( function ( resolve, reject ) {
							var s = document.createElement( 'script' );
							s.src = 'https://unpkg.com/hydra-synth/dist/hydra-synth.js';
							s.onload = resolve; s.onerror = reject;
							document.head.appendChild( s );
						} );
					}
					await window._hydraSynthLoading;
				}
				var hydraInstance = new window.Hydra( {
					detectAudio: false, makeGlobal: false, canvas: hydraCanvas } );
				await new Promise( function ( r ) { setTimeout( r, 150 ); } );
				var synthKeys = Object.keys( hydraInstance.synth );
				var synthValues = synthKeys.map( function ( k ) { return hydraInstance.synth[ k ]; } );
				// Evaluate the whole script as one program (not line-by-line) so
				// multi-line chains like `osc(...)\n.color(...)\n.out()` parse correctly
				try { new Function( synthKeys.join( ',' ), code ).apply( null, synthValues ); } // eslint-disable-line no-new-func
				catch ( e ) { console.warn( 'Hydra eval:', code, e ); }
				var tex = new THREE.CanvasTexture( hydraCanvas );
				tex.needsUpdate = true;
				object.traverse( function ( child ) {
					if ( child.isMesh ) {
						child.material = new THREE.MeshPhongMaterial( { map: tex } );
					}
				} );
				( function loop() { tex.needsUpdate = true; requestAnimationFrame( loop ); } )();
				editor.signals.sceneGraphChanged.dispatch();
			} catch ( err ) {
				console.error( 'Hydra texture error:', err );
			}
		} )();
	}

	// Export JSON

	const exportJson = new UIButton( strings.getKey( 'sidebar/object/export' ) );
	exportJson.setMarginLeft( '120px' );
	exportJson.onClick( function () {

		const object = editor.selected;

		let output = object.toJSON();

		try {

			output = JSON.stringify( output, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

		} catch ( error ) {

			output = JSON.stringify( output );

		}


		editor.utils.save( new Blob( [ output ] ), `${ objectName.getValue() || 'object' }.json` );

	} );
	container.add( exportJson );

	//

	function update() {

		const object = editor.selected;

		if ( object !== null ) {

			const newPosition = new THREE.Vector3( objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue() );
			if ( object.position.distanceTo( newPosition ) >= 0.01 ) {

        editor.sendMqtt(
          `setObjectPosition`,
          {
            "objectName": object.name,
            "uuid": object.uuid,
            //"position": object.position,
            "newPosition": newPosition,
            //"object": object
          }
        );

				editor.execute( new SetPositionCommand( editor, object, newPosition ) );

			}

			const newRotation = new THREE.Euler( objectRotationX.getValue() * THREE.MathUtils.DEG2RAD, objectRotationY.getValue() * THREE.MathUtils.DEG2RAD, objectRotationZ.getValue() * THREE.MathUtils.DEG2RAD );
			if ( new THREE.Vector3().setFromEuler( object.rotation ).distanceTo( new THREE.Vector3().setFromEuler( newRotation ) ) >= 0.01 ) {

        editor.sendMqtt(
          `setObjectRotation`,
          {
            "objectName": object.name,
            "uuid": object.uuid,
            //"position": object.position,
            "newRotation": newRotation,
            //"object": object
          }
        );

				editor.execute( new SetRotationCommand( editor, object, newRotation ) );

			}

			const newScale = new THREE.Vector3( objectScaleX.getValue(), objectScaleY.getValue(), objectScaleZ.getValue() );
			if ( object.scale.distanceTo( newScale ) >= 0.01 ) {

        editor.sendMqtt(
          `setObjectScale`,
          {
            "objectName": object.name,
            "uuid": object.uuid,
            //"position": object.position,
            "newScale": newScale,
            //"object": object
          }
        );

				editor.execute( new SetScaleCommand( editor, object, newScale ) );

			}

			if ( object.fov !== undefined && Math.abs( object.fov - objectFov.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'fov', objectFov.getValue() ) );
				object.updateProjectionMatrix();

			}

			if ( object.left !== undefined && Math.abs( object.left - objectLeft.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'left', objectLeft.getValue() ) );
				object.updateProjectionMatrix();

			}

			if ( object.right !== undefined && Math.abs( object.right - objectRight.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'right', objectRight.getValue() ) );
				object.updateProjectionMatrix();

			}

			if ( object.top !== undefined && Math.abs( object.top - objectTop.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'top', objectTop.getValue() ) );
				object.updateProjectionMatrix();

			}

			if ( object.bottom !== undefined && Math.abs( object.bottom - objectBottom.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'bottom', objectBottom.getValue() ) );
				object.updateProjectionMatrix();

			}

			if ( object.near !== undefined && Math.abs( object.near - objectNear.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'near', objectNear.getValue() ) );
				if ( object.isOrthographicCamera ) {

					object.updateProjectionMatrix();

				}

			}

			if ( object.far !== undefined && Math.abs( object.far - objectFar.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'far', objectFar.getValue() ) );
				if ( object.isOrthographicCamera ) {

					object.updateProjectionMatrix();

				}

			}

			if ( object.intensity !== undefined && Math.abs( object.intensity - objectIntensity.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'intensity', objectIntensity.getValue() ) );

			}

			if ( object.color !== undefined && object.color.getHex() !== objectColor.getHexValue() ) {

				editor.execute( new SetColorCommand( editor, object, 'color', objectColor.getHexValue() ) );

			}

			if ( object.groundColor !== undefined && object.groundColor.getHex() !== objectGroundColor.getHexValue() ) {

				editor.execute( new SetColorCommand( editor, object, 'groundColor', objectGroundColor.getHexValue() ) );

			}

			if ( object.distance !== undefined && Math.abs( object.distance - objectDistance.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'distance', objectDistance.getValue() ) );

			}

			if ( object.angle !== undefined && Math.abs( object.angle - objectAngle.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'angle', objectAngle.getValue() ) );

			}

			if ( object.penumbra !== undefined && Math.abs( object.penumbra - objectPenumbra.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'penumbra', objectPenumbra.getValue() ) );

			}

			if ( object.decay !== undefined && Math.abs( object.decay - objectDecay.getValue() ) >= 0.01 ) {

				editor.execute( new SetValueCommand( editor, object, 'decay', objectDecay.getValue() ) );

			}

			if ( object.visible !== objectVisible.getValue() ) {

				editor.execute( new SetValueCommand( editor, object, 'visible', objectVisible.getValue() ) );

			}

			if ( object.frustumCulled !== objectFrustumCulled.getValue() ) {

				editor.execute( new SetValueCommand( editor, object, 'frustumCulled', objectFrustumCulled.getValue() ) );

			}

			if ( object.renderOrder !== objectRenderOrder.getValue() ) {

				editor.execute( new SetValueCommand( editor, object, 'renderOrder', objectRenderOrder.getValue() ) );

			}

			if ( object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue() ) {

				editor.execute( new SetValueCommand( editor, object, 'castShadow', objectCastShadow.getValue() ) );

			}

			if ( object.receiveShadow !== objectReceiveShadow.getValue() ) {

				if ( object.material !== undefined ) object.material.needsUpdate = true;
				editor.execute( new SetValueCommand( editor, object, 'receiveShadow', objectReceiveShadow.getValue() ) );

			}

			if ( object.shadow !== undefined ) {

				if ( object.shadow.intensity !== objectShadowIntensity.getValue() ) {

					editor.execute( new SetShadowValueCommand( editor, object, 'intensity', objectShadowIntensity.getValue() ) );

				}

				if ( object.shadow.bias !== objectShadowBias.getValue() ) {

					editor.execute( new SetShadowValueCommand( editor, object, 'bias', objectShadowBias.getValue() ) );

				}

				if ( object.shadow.normalBias !== objectShadowNormalBias.getValue() ) {

					editor.execute( new SetShadowValueCommand( editor, object, 'normalBias', objectShadowNormalBias.getValue() ) );

				}

				if ( object.shadow.radius !== objectShadowRadius.getValue() ) {

					editor.execute( new SetShadowValueCommand( editor, object, 'radius', objectShadowRadius.getValue() ) );

				}

			}

			try {

				const userData = JSON.parse( objectUserData.getValue() );
				if ( JSON.stringify( object.userData ) != JSON.stringify( userData ) ) {

					editor.execute( new SetValueCommand( editor, object, 'userData', userData ) );

				}

			} catch ( exception ) {

				console.warn( exception );

			}

		}

	}

	function updateRows( object ) {

		const properties = {
			'fov': objectFovRow,
			'left': objectLeftRow,
			'right': objectRightRow,
			'top': objectTopRow,
			'bottom': objectBottomRow,
			'near': objectNearRow,
			'far': objectFarRow,
			'intensity': objectIntensityRow,
			'color': objectColorRow,
			'groundColor': objectGroundColorRow,
			'distance': objectDistanceRow,
			'angle': objectAngleRow,
			'penumbra': objectPenumbraRow,
			'decay': objectDecayRow,
			'castShadow': objectShadowRow,
			'receiveShadow': objectReceiveShadow,
			'shadow': [ objectShadowIntensityRow, objectShadowBiasRow, objectShadowNormalBiasRow, objectShadowRadiusRow ]
		};

		for ( const property in properties ) {

			const uiElement = properties[ property ];

			if ( Array.isArray( uiElement ) === true ) {

				for ( let i = 0; i < uiElement.length; i ++ ) {

					uiElement[ i ].setDisplay( object[ property ] !== undefined ? '' : 'none' );

				}

			} else {

				uiElement.setDisplay( object[ property ] !== undefined ? '' : 'none' );

			}

		}

		objectDefaultCameraRow.setDisplay( object.isCamera ? '' : 'none' );

		//

		if ( object.isLight ) {

			objectReceiveShadow.setDisplay( 'none' );

		}

		if ( object.isAmbientLight || object.isHemisphereLight ) {

			objectShadowRow.setDisplay( 'none' );

		}

	}

	function updateTransformRows( object ) {

		if ( object.isLight ) {

			objectRotationRow.setDisplay( 'none' );
			objectScaleRow.setDisplay( 'none' );

		} else {

			objectRotationRow.setDisplay( '' );
			objectScaleRow.setDisplay( '' );

		}

	}

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object !== null ) {

			container.setDisplay( 'block' );

			updateRows( object );
			updateUI( object );

		} else {

			container.setDisplay( 'none' );

		}

	} );

	signals.objectChanged.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

	signals.refreshSidebarObject3D.add( function ( object ) {

		if ( object !== editor.selected ) return;

		updateUI( object );

	} );

	function updateUI( object ) {

		objectType.setValue( object.type );

		objectUUID.setValue( object.uuid );
		objectName.setValue( object.name );

		objectPositionX.setValue( object.position.x );
		objectPositionY.setValue( object.position.y );
		objectPositionZ.setValue( object.position.z );

		objectRotationX.setValue( object.rotation.x * THREE.MathUtils.RAD2DEG );
		objectRotationY.setValue( object.rotation.y * THREE.MathUtils.RAD2DEG );
		objectRotationZ.setValue( object.rotation.z * THREE.MathUtils.RAD2DEG );

		objectScaleX.setValue( object.scale.x );
		objectScaleY.setValue( object.scale.y );
		objectScaleZ.setValue( object.scale.z );

		if ( object.isCamera ) {

			objectDefaultCameraCheckbox.setValue( !! object.userData.wvIsDefaultCamera );

		}

		if ( object.fov !== undefined ) {

			objectFov.setValue( object.fov );

		}

		if ( object.left !== undefined ) {

			objectLeft.setValue( object.left );

		}

		if ( object.right !== undefined ) {

			objectRight.setValue( object.right );

		}

		if ( object.top !== undefined ) {

			objectTop.setValue( object.top );

		}

		if ( object.bottom !== undefined ) {

			objectBottom.setValue( object.bottom );

		}

		if ( object.near !== undefined ) {

			objectNear.setValue( object.near );

		}

		if ( object.far !== undefined ) {

			objectFar.setValue( object.far );

		}

		if ( object.intensity !== undefined ) {

			objectIntensity.setValue( object.intensity );

		}

		if ( object.color !== undefined ) {

			objectColor.setHexValue( object.color.getHexString() );

		}

		if ( object.groundColor !== undefined ) {

			objectGroundColor.setHexValue( object.groundColor.getHexString() );

		}

		if ( object.distance !== undefined ) {

			objectDistance.setValue( object.distance );

		}

		if ( object.angle !== undefined ) {

			objectAngle.setValue( object.angle );

		}

		if ( object.penumbra !== undefined ) {

			objectPenumbra.setValue( object.penumbra );

		}

		if ( object.decay !== undefined ) {

			objectDecay.setValue( object.decay );

		}

		if ( object.castShadow !== undefined ) {

			objectCastShadow.setValue( object.castShadow );

		}

		if ( object.receiveShadow !== undefined ) {

			objectReceiveShadow.setValue( object.receiveShadow );

		}

		if ( object.shadow !== undefined ) {

			objectShadowIntensity.setValue( object.shadow.intensity );
			objectShadowBias.setValue( object.shadow.bias );
			objectShadowNormalBias.setValue( object.shadow.normalBias );
			objectShadowRadius.setValue( object.shadow.radius );

		}

		objectVisible.setValue( object.visible );
		objectFrustumCulled.setValue( object.frustumCulled );
		objectRenderOrder.setValue( object.renderOrder );

		try {

			objectUserData.setValue( JSON.stringify( object.userData, null, '  ' ) );

		} catch ( error ) {

			console.log( error );

		}

		objectUserData.setBorderColor( 'transparent' );
		objectUserData.setBackgroundColor( '' );

		// ── Refresh WV texture fields ─────────────────────────────────────────
		objectHydraScript.setValue( object.userData.texture || '' );
		objectColorTexPicker.setValue( object.userData.colorTexture || '#ffffff' );
		objectSceneTexLabel.setValue( object.userData.sceneTexture ? ( object.userData.sceneTextureTitle || ( 'Scene #' + object.userData.sceneTexture ) ) : '' );
		const wvImageId = object.userData.imageTexture;
		if ( wvImageId ) {
			fetch( '/wp-json/wp/v2/media/' + wvImageId )
				.then( function ( r ) { return r.json(); } )
				.then( function ( d ) {
					if ( ! d || ! d.source_url ) {
						objectImageTexPreviewImg.style.display = 'none';
						objectImageTexPreviewImg.src = '';
						return;
					}
					objectImageTexPreviewImg.src = d.source_url;
					objectImageTexPreviewImg.style.display = 'block';
				} )
				.catch( function () { objectImageTexPreviewImg.style.display = 'none'; } );
		} else {
			objectImageTexPreviewImg.style.display = 'none';
			objectImageTexPreviewImg.src = '';
		}
		// Use stored videoTexture; fall back to extracting it from the hydra code
		const wvVideoUrl = object.userData.videoTexture
			|| _extractVideoFromHydra( object.userData.texture );
		objectVideoTexLabel.setValue( wvVideoUrl ? wvVideoUrl.split( '/' ).pop() : '' );

		updateTransformRows( object );

	}

	return container;

}

export { SidebarObject };
