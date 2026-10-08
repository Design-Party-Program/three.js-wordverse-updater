import { UIPanel, UISelect } from './libs/ui.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function ViewportControls( editor ) {

	const signals = editor.signals;

	const container = new UIPanel();
	container.setPosition( 'absolute' );
	container.setRight( '10px' );
	container.setTop( '10px' );

	// camera

	const cameraSelect = new UISelect();
	cameraSelect.setMarginRight( '10px' );
	cameraSelect.onChange( function () {

		editor.setViewportCamera( this.getValue() );

	} );
	container.add( cameraSelect );

	signals.cameraAdded.add( update );
	signals.cameraRemoved.add( update );
	signals.objectChanged.add( function ( object ) {

		if ( object.isCamera ) {

			updateCameraList();

		}

	} );

	// shading

	const shadingSelect = new UISelect();
	shadingSelect.setOptions( { 'realistic': 'realistic', 'solid': 'solid', 'normals': 'normals', 'wireframe': 'wireframe' } );
	shadingSelect.setValue( 'solid' );
	shadingSelect.onChange( function () {

		editor.setViewportShading( this.getValue() );

	} );
	container.add( shadingSelect );

	signals.editorCleared.add( function () {

		editor.setViewportCamera( editor.camera.uuid );

		shadingSelect.setValue( 'solid' );
		editor.setViewportShading( shadingSelect.getValue() );

		lodSelect.setValue( 'auto' );

	} );

	signals.cameraResetted.add( update );

	update();

	//

	// LOD preview (local only, not synced/saved) - swaps each vr-model's
	// displayed geometry between its full-res source and the lod_high/medium/low
	// GLBs generated server-side, without touching position/rotation/scale/uuid

	const lodSelect = new UISelect();
	lodSelect.setMarginRight( '10px' );
	lodSelect.setOptions( { 'auto': 'LOD: Full', 'lod_high': 'LOD: High', 'lod_medium': 'LOD: Medium', 'lod_low': 'LOD: Low' } );
	lodSelect.setValue( 'auto' );
	lodSelect.onChange( function () {

		applyLodLevel( this.getValue() );

	} );
	container.add( lodSelect );

	function clearChildren( object ) {

		while ( object.children.length ) {

			object.remove( object.children[ 0 ] );

		}

	}

	function adoptChildren( object, children ) {

		children.forEach( ( child ) => object.add( child ) );

	}

	function loadLodChildren( url ) {

		return fetch( url )
			.then( ( response ) => response.arrayBuffer() )
			.then( ( buffer ) => new Promise( ( resolve, reject ) => {

				new GLTFLoader().parse( buffer, '', ( gltf ) => resolve( gltf.scene.children.slice() ), reject );

			} ) );

	}

	// ACF's REST output only resolves file fields to a URL when the request
	// includes ?acf_format=standard; the editor's model fetches don't, so
	// lod_high/medium/low usually arrive as a raw attachment ID instead
	async function resolveMediaUrl( value ) {

		if ( ! value ) return null;
		if ( typeof value === 'string' && /^https?:\/\//i.test( value ) ) return value;

		const mediaId = ( value && typeof value === 'object' ) ? ( value.ID || value.id ) : value;
		if ( ! mediaId ) return null;

		const media = await fetch( '/wp-json/wp/v2/media/' + mediaId ).then( ( r ) => r.json() );
		return media.source_url || null;

	}

	async function applyLodLevel( level ) {

		for ( const object of editor.scene.children ) {

			const wpData = object.userData && object.userData.wpData;
			if ( ! wpData || wpData.type !== 'vr-model' ) continue;

			// cache the originally-loaded (full-res) children once, so "Full" can
			// restore them without re-fetching the source model
			if ( ! object.userData._wvOriginalChildren ) {

				object.userData._wvOriginalChildren = object.children.slice();

			}

			if ( level === 'auto' ) {

				clearChildren( object );
				adoptChildren( object, object.userData._wvOriginalChildren );
				continue;

			}

			const lodValue = wpData.acf && wpData.acf[ level ];
			if ( ! lodValue ) continue; // no LOD generated for this tier yet - leave the model as-is

			object.userData._wvLodCache = object.userData._wvLodCache || {};

			if ( ! object.userData._wvLodCache[ level ] ) {

				try {

					const lodUrl = await resolveMediaUrl( lodValue );
					if ( ! lodUrl ) continue;

					object.userData._wvLodCache[ level ] = await loadLodChildren( lodUrl );

				} catch ( err ) {

					console.error( 'LOD preview: failed to load', level, lodValue, err );
					continue;

				}

			}

			clearChildren( object );
			adoptChildren( object, object.userData._wvLodCache[ level ] );

		}

		editor.signals.sceneGraphChanged.dispatch();

	}

	function updateCameraList() {

		const options = {};

		const cameras = editor.cameras;

		for ( const key in cameras ) {

			const camera = cameras[ key ];
			options[ camera.uuid ] = camera.name;

		}

		cameraSelect.setOptions( options );

		const selectedCamera = ( editor.viewportCamera.uuid in options )
			? editor.viewportCamera
			: editor.camera;

		cameraSelect.setValue( selectedCamera.uuid );

		return selectedCamera;

	}

	function update() {

		const selectedCamera = updateCameraList();
		editor.setViewportCamera( selectedCamera.uuid );

	}

	return container;

}

export { ViewportControls };
