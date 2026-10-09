import * as THREE from 'three';

import { Config } from './Config.js';
import { Loader } from './Loader.js';
import { History as _History } from './History.js';
import { Strings } from './Strings.js';
import { Storage as _Storage } from './Storage.js';
import { Selector } from './Selector.js';

var _DEFAULT_CAMERA = new THREE.PerspectiveCamera( 50, 1, 0.001, 1e10 );
_DEFAULT_CAMERA.name = 'Camera';
_DEFAULT_CAMERA.position.set( 0, 5, 10 );
_DEFAULT_CAMERA.lookAt( new THREE.Vector3() );
const _ORTHOGRAPHIC_FRUSTUM_SIZE = 100;

function Editor() {

	const Signal = signals.Signal; // eslint-disable-line no-undef

	this.signals = {

		// script

		editScript: new Signal(),

		// player

		startPlayer: new Signal(),
		stopPlayer: new Signal(),

		// xr

		enterXR: new Signal(),
		offerXR: new Signal(),
		leaveXR: new Signal(),

		// notifications

		editorCleared: new Signal(),

		savingStarted: new Signal(),
		savingFinished: new Signal(),

		transformModeChanged: new Signal(),
		snapChanged: new Signal(),
		spaceChanged: new Signal(),
		rendererCreated: new Signal(),
		rendererUpdated: new Signal(),
		rendererDetectKTX2Support: new Signal(),

		sceneBackgroundChanged: new Signal(),
		sceneEnvironmentChanged: new Signal(),
		sceneFogChanged: new Signal(),
		sceneFogSettingsChanged: new Signal(),
		sceneGraphChanged: new Signal(),
		sceneRendered: new Signal(),

		cameraChanged: new Signal(),
		cameraResetted: new Signal(),

		geometryChanged: new Signal(),

		objectSelected: new Signal(),
		objectFocused: new Signal(),

		objectAdded: new Signal(),
		objectChanged: new Signal(),
		objectRemoved: new Signal(),

		avatarAdded: new Signal(),

		cameraAdded: new Signal(),
		cameraRemoved: new Signal(),

		helperAdded: new Signal(),
		helperRemoved: new Signal(),

		materialAdded: new Signal(),
		materialChanged: new Signal(),
		materialRemoved: new Signal(),

		scriptAdded: new Signal(),
		scriptChanged: new Signal(),
		scriptRemoved: new Signal(),

		windowResize: new Signal(),

		showHelpersChanged: new Signal(),
		refreshSidebarObject3D: new Signal(),
		historyChanged: new Signal(),

		viewportCameraChanged: new Signal(),
		viewportShadingChanged: new Signal(),

		intersectionsDetected: new Signal(),

		pathTracerUpdated: new Signal(),

		animationPanelChanged: new Signal(),
		animationPanelResized: new Signal(),

		morphTargetsUpdated: new Signal()

	};

	this.config = new Config();
	this.history = new _History( this );
	this.selector = new Selector( this );
	this.storage = new _Storage();
	this.strings = new Strings( this.config );

	this.loader = new Loader( this );

	this.camera = _DEFAULT_CAMERA.clone();

	this.scene = new THREE.Scene();
	this.scene.name = 'Scene';

	this.sceneHelpers = new THREE.Scene();
	this.sceneHelpers.add( new THREE.HemisphereLight( 0xffffff, 0x888888, 2 ) );

	this.backgroundType = 'Default';
	this.environmentType = 'Default';

	this.object = {};
	this.geometries = {};
	this.materials = {};
	this.textures = {};
	this.scripts = {};

	this.materialsRefCounter = new Map(); // tracks how often is a material used by a 3D object

	this.mixer = new THREE.AnimationMixer( this.scene );

	this.selected = null;
	this.helpers = {};

	this.cameras = {};

	this.viewportCamera = this.camera;
	this.viewportShading = 'default';
	this.viewportColor = new THREE.Color();

  // mqtt addition
  this.sendMQTT = () => { console.log('mqtt not initiated yet') };
	this.addCamera( this.camera );

}

Editor.prototype = {

	setScene: function ( scene ) {

		this.scene.uuid = scene.uuid;
		this.scene.name = scene.name;

		this.scene.background = scene.background;
		this.scene.environment = scene.environment;
		this.scene.fog = scene.fog;
		this.scene.backgroundBlurriness = scene.backgroundBlurriness;
		this.scene.backgroundIntensity = scene.backgroundIntensity;

		this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

		// avoid render per object

		this.signals.sceneGraphChanged.active = false;

		while ( scene.children.length > 0 ) {

			this.addObject( scene.children[ 0 ] );

		}

		this.signals.sceneGraphChanged.active = true;
		this.signals.sceneGraphChanged.dispatch();

		this.signals.sceneEnvironmentChanged.dispatch( this.environmentType, scene.environment );

	},

	//

	addObject: function ( object, parent, index ) {

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addCamera( child );
			scope.addHelper( child );

		} );

		if ( parent === undefined ) {

			this.scene.add( object );

		} else {

			parent.children.splice( index, 0, object );
			object.parent = parent;

		}

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addObjectAndSetMeta: function ( object, meta, parent, index ) {

    console.log("addObjectAndSetMeta", meta);

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			scope.addCamera( child );
			scope.addHelper( child );

		} );

		if ( parent === undefined ) {

			this.scene.add( object );

      /* hack to set uuid & name */
      meta.uuid && (object.uuid = meta.uuid);
      meta.name && (object.name = meta.name);
      /* /hack to set uuid & name */
      if( meta.position ){
        object.position.x = meta.position.x;
        object.position.y = meta.position.y;
        object.position.z = meta.position.z;
      }
      
      if( meta.rotation ){
        object.rotation.x = meta.rotation.x;
        object.rotation.y = meta.rotation.y;
        object.rotation.z = meta.rotation.z;
      }

      if( meta.scale ){
        object.scale.x = meta.scale.x;
        object.scale.y = meta.scale.y;
        object.scale.z = meta.scale.z;
      }

      // Camera-specific lens settings + default-camera flag (admin/three editor's
      // Sidebar.Object.js "Default Camera" toggle; only one camera should be default)
      if ( object.isCamera ) {
        if ( meta.fov !== undefined && meta.fov !== null ) object.fov = meta.fov;
        if ( meta.near !== undefined && meta.near !== null ) object.near = meta.near;
        if ( meta.far !== undefined && meta.far !== null ) object.far = meta.far;
        if ( typeof object.updateProjectionMatrix === 'function' ) object.updateProjectionMatrix();
        if ( meta.is_default ) {
          this.scene.traverse( function ( node ) {
            if ( node.isCamera && node !== object ) node.userData.wvIsDefaultCamera = false;
          } );
        }
        object.userData.wvIsDefaultCamera = !! meta.is_default;
      }

      // Ctrl+G group membership: reparent into the matching group container,
      // which Menubar.VrScenes.js/MqttConnector.js must create before this
      // object loads. Falls back to staying top-level if the group isn't found.
      if ( meta.group_uuid ) {
        const targetGroup = this.objectByUuid( meta.group_uuid );
        if ( targetGroup ) {
          this.scene.children.splice( this.scene.children.indexOf( object ), 1 );
          targetGroup.children.push( object );
          object.parent = targetGroup;
        }
      }

      object.userData = meta.wpData ? {...object.userData, wpData:meta.wpData} : object.userData;

      // Persist texture source fields so the Sidebar can read + re-apply them
      if (meta.imageTexture) object.userData.imageTexture = meta.imageTexture;
      if (meta.texture)      object.userData.texture      = meta.texture;
      if (meta.colorTexture) object.userData.colorTexture = meta.colorTexture;
      if (meta.sceneTexture) object.userData.sceneTexture = meta.sceneTexture;
      // Use explicit videoTexture first; fall back to extracting it from the hydra code
      if (meta.videoTexture) {
        object.userData.videoTexture = meta.videoTexture;
      } else if (meta.texture) {
        var _vm = meta.texture.match(/initVideo\(\s*["']([^"']+)["']\s*\)/);
        if (_vm) object.userData.videoTexture = _vm[1];
      }

      // ── colorTexture: flat hex color → solid-color material (no map) ──
      if (meta.colorTexture) {
        const colorHex = meta.colorTexture;
        object.traverse(function(child) {
          if (child.isMesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(function(mat) {
              const m = mat.clone();
              m.map = null;
              m.color.set(colorHex);
              m.needsUpdate = true;
              child.material = m;
            });
          }
        });
      }

      // ── sceneTexture: another vr-scenes post ID → text placeholder (the
      // real off-screen render only happens in the r3f player) ──
      if (meta.sceneTexture) {
        fetch('/wp-json/wp/v2/vr-scenes/' + meta.sceneTexture)
          .then(function(r) { return r.json(); })
          .then(function(sceneData) {
            const label = sceneData && sceneData.title ? sceneData.title.rendered : ('Scene #' + meta.sceneTexture);
            object.userData.sceneTextureTitle = label;
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#202030';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PORTAL', canvas.width / 2, canvas.height / 2 - 20);
            ctx.font = '24px sans-serif';
            ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 24);
            const portalTexture = new THREE.CanvasTexture(canvas);
            portalTexture.needsUpdate = true;
            object.traverse(function(child) {
              if (child.isMesh) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(function(mat) {
                  const m = mat.clone();
                  m.map = portalTexture;
                  m.color.set('#ffffff');
                  m.needsUpdate = true;
                  child.material = m;
                });
              }
            });
            this.signals.sceneGraphChanged.dispatch();
          }.bind(this));
      }

      // ── imageTexture: WP media attachment ID → fetch URL → canvas texture ──
      if (meta.imageTexture) {
        fetch('/wp-json/wp/v2/media/' + meta.imageTexture)
          .then(function(r) { return r.json(); })
          .then(function(mediaData) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              // Flip vertically, matching the r3f player behaviour
              ctx.scale(1, -1);
              ctx.translate(0, -img.height);
              ctx.drawImage(img, 0, 0);
              const imgTexture = new THREE.CanvasTexture(canvas);
              imgTexture.needsUpdate = true;
              object.traverse(function(child) {
                if (child.isMesh) {
                  const mats = Array.isArray(child.material)
                    ? child.material : [child.material];
                  mats.forEach(function(mat) {
                    const m = mat.clone();
                    m.map = imgTexture;
                    m.needsUpdate = true;
                    child.material = m;
                  });
                }
              });
              scope.signals.sceneGraphChanged.dispatch();
            };
            img.onerror = function() {
              console.error('imageTexture: failed to load image from', mediaData.source_url);
            };
            if ( ! mediaData || ! mediaData.source_url ) {
              console.warn('imageTexture: media lookup returned no source_url', meta.imageTexture, mediaData);
              return;
            }
            img.src = mediaData.source_url;
          })
          .catch(function(err) {
            console.error('imageTexture: WP media fetch failed', err);
          });
      }

      // ── texture: Hydra JS string → offscreen canvas → animated CanvasTexture ──
      if (meta.texture) {
        (async function(textureCode) {
          try {
            const hydraCanvas = document.createElement('canvas');
            hydraCanvas.width = 1024;
            hydraCanvas.height = 1024;
            hydraCanvas.style.cssText = 'position:absolute;right:-2048px;bottom:0;z-index:-1;pointer-events:none;';
            document.body.appendChild(hydraCanvas);

            // Load hydra-synth UMD once; subsequent calls reuse the same promise
            if (!window.Hydra) {
              if (!window._hydraSynthLoading) {
                window._hydraSynthLoading = new Promise(function(resolve, reject) {
                  const script = document.createElement('script');
                  script.src = 'https://unpkg.com/hydra-synth/dist/hydra-synth.js';
                  script.onload = resolve;
                  script.onerror = reject;
                  document.head.appendChild(script);
                });
              }
              await window._hydraSynthLoading;
            }

            const hydraInstance = new window.Hydra({
              detectAudio: false,
              makeGlobal: false,
              canvas: hydraCanvas,
            });

            // Give hydra time to initialise before evaluating code
            await new Promise(function(resolve) { setTimeout(resolve, 150); });

            // Evaluate the whole script as one program (not line-by-line) so
            // multi-line chains like `osc(...)\n.color(...)\n.out()` parse
            // correctly, binding every hydraInstance.synth method (osc, shape,
            // noise, ...) as a local so nested generator arguments (e.g.
            // mask(shape(...))) resolve too, not just the outermost call
            const synthKeys = Object.keys(hydraInstance.synth);
            const synthValues = synthKeys.map(function(k) { return hydraInstance.synth[k]; });
            try {
              new Function(synthKeys.join(','), textureCode).apply(null, synthValues); // eslint-disable-line no-new-func
            } catch(e) {
              console.warn('Hydra eval error:', textureCode, e);
            }

            const canvasTexture = new THREE.CanvasTexture(hydraCanvas);
            canvasTexture.needsUpdate = true;
            object.traverse(function(child) {
              if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({ map: canvasTexture });
                child.material.needsUpdate = true;
              }
            });

            // Mark texture dirty every frame so hydra animation plays
            (function frameLoop() {
              canvasTexture.needsUpdate = true;
              requestAnimationFrame(frameLoop);
            })();

            scope.signals.sceneGraphChanged.dispatch();
          } catch(err) {
            console.error('Hydra texture setup failed:', err);
          }
        })(meta.texture);
      }

		} else {

			parent.children.splice( index, 0, object );
			object.parent = parent;

		}

		this.signals.objectAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	nameObject: function ( object, name ) {

		object.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	removeObject: function ( object ) {

		if ( object.parent === null ) return; // avoid deleting the camera or scene

		var scope = this;


    console.log('send removeObject MQTT Message');


		object.traverse( function ( child ) {

			scope.removeCamera( child );
			scope.removeHelper( child );

			if ( child.material !== undefined ) scope.removeMaterial( child.material );

		} );

		object.parent.remove( object );

		this.signals.objectRemoved.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	addGeometry: function ( geometry ) {

		this.geometries[ geometry.uuid ] = geometry;

	},

	setGeometryName: function ( geometry, name ) {

		geometry.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addMaterial: function ( material ) {

		if ( Array.isArray( material ) ) {

			for ( var i = 0, l = material.length; i < l; i ++ ) {

				this.addMaterialToRefCounter( material[ i ] );

			}

		} else {

			this.addMaterialToRefCounter( material );

		}

		this.signals.materialAdded.dispatch();

	},

	addMaterialToRefCounter: function ( material ) {

		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get( material );

		if ( count === undefined ) {

			materialsRefCounter.set( material, 1 );
			this.materials[ material.uuid ] = material;

		} else {

			count ++;
			materialsRefCounter.set( material, count );

		}

	},

	removeMaterial: function ( material ) {

		if ( Array.isArray( material ) ) {

			for ( var i = 0, l = material.length; i < l; i ++ ) {

				this.removeMaterialFromRefCounter( material[ i ] );

			}

		} else {

			this.removeMaterialFromRefCounter( material );

		}

		this.signals.materialRemoved.dispatch();

	},

	removeMaterialFromRefCounter: function ( material ) {

		var materialsRefCounter = this.materialsRefCounter;

		var count = materialsRefCounter.get( material );
		count --;

		if ( count === 0 ) {

			materialsRefCounter.delete( material );
			delete this.materials[ material.uuid ];

		} else {

			materialsRefCounter.set( material, count );

		}

	},

	getMaterialById: function ( id ) {

		var material;
		var materials = Object.values( this.materials );

		for ( var i = 0; i < materials.length; i ++ ) {

			if ( materials[ i ].id === id ) {

				material = materials[ i ];
				break;

			}

		}

		return material;

	},

	setMaterialName: function ( material, name ) {

		material.name = name;
		this.signals.sceneGraphChanged.dispatch();

	},

	addTexture: function ( texture ) {

		this.textures[ texture.uuid ] = texture;

	},

	//

	addCamera: function ( camera ) {

		if ( camera.isCamera ) {

      this.sendMqtt( 
        `addCamera`,
        {
          uuid: camera.uuid,
          //options: JSON.stringify(options)
        }
      );

      camera.addEventListener('change', this.sendMqtt( 
        `setCameraPosition`,
        {
          uuid: camera.uuid,
          position: JSON.stringify(camera.position)
        }
      ));

			this.cameras[ camera.uuid ] = camera;

			this.signals.cameraAdded.dispatch( camera );

		}

	},

	removeCamera: function ( camera ) {

		if ( this.cameras[ camera.uuid ] !== undefined ) {

			delete this.cameras[ camera.uuid ];

			this.signals.cameraRemoved.dispatch( camera );

		}

	},

	//

	addHelper: function () {

		var geometry = new THREE.SphereGeometry( 2, 4, 2 );
		var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

		return function ( object, helper ) {

			if ( helper === undefined ) {

				if ( object.isCamera ) {

					helper = new THREE.CameraHelper( object );

				} else if ( object.isPointLight ) {

					helper = new THREE.PointLightHelper( object, 1 );

					helper.matrix = new THREE.Matrix4();
					helper.matrixAutoUpdate = true;

					const light = object;
					const editor = this;

					helper.updateMatrixWorld = function () {

						light.getWorldPosition( this.position );

						const distance = editor.viewportCamera.position.distanceTo( this.position );
						this.scale.setScalar( distance / 30 );

						this.updateMatrix();
						this.matrixWorld.copy( this.matrix );

						const children = this.children;

						for ( let i = 0, l = children.length; i < l; i ++ ) {

							children[ i ].updateMatrixWorld();

						}

					};

				} else if ( object.isDirectionalLight ) {

					helper = new THREE.DirectionalLightHelper( object, 1 );

				} else if ( object.isSpotLight ) {

					helper = new THREE.SpotLightHelper( object );

				} else if ( object.isHemisphereLight ) {

					helper = new THREE.HemisphereLightHelper( object, 1 );

				} else if ( object.isSkinnedMesh ) {

					helper = new THREE.SkeletonHelper( object.skeleton.bones[ 0 ] );
					helper.userData.object = object;

				} else if ( object.isBone === true && object.parent && object.parent.isBone !== true ) {

					helper = new THREE.SkeletonHelper( object );
					helper.userData.object = object;

				} else {

					// no helper for this object type
					return;

				}

				if ( helper.isSkeletonHelper !== true ) {

					const picker = new THREE.Mesh( geometry, material );
					picker.name = 'picker';
					picker.userData.object = object;
					helper.add( picker );

				}

			}

			this.sceneHelpers.add( helper );
			this.helpers[ object.id ] = helper;

			this.signals.helperAdded.dispatch( helper );

		};

	}(),

	removeHelper: function ( object ) {

		if ( this.helpers[ object.id ] !== undefined ) {

			var helper = this.helpers[ object.id ];
			helper.parent.remove( helper );
			helper.dispose();

			delete this.helpers[ object.id ];

			this.signals.helperRemoved.dispatch( helper );

		}

	},
  

	addAvatarAndSetMeta: function ( object, meta, parent, index ) {

    console.log("addAvatarAndSetMeta", meta);

		var scope = this;

		object.traverse( function ( child ) {

			if ( child.geometry !== undefined ) scope.addGeometry( child.geometry );
			if ( child.material !== undefined ) scope.addMaterial( child.material );

			// scope.addCamera( child );
			// scope.addHelper( child );

		} );

		if ( parent === undefined ) {

			//this.scene.add( object );

      const avatarGroup = this.objectByUuid(meta.uuid);

      /* hack to set uuid & name */
      //meta.uuid && (object.uuid = meta.uuid);
      //meta.name && (object.name = meta.name);

      /* /hack to set uuid & name */

      // if( meta.position ){
      //   object.position.x = meta.position.x;
      //   object.position.y = meta.position.y;
      //   object.position.z = meta.position.z;
      // }
      
      // if( meta.rotation ){
      //   object.rotation.x = meta.rotation.x;
      //   object.rotation.y = meta.rotation.y;
      //   object.rotation.z = meta.rotation.z;
      // }

      // if( meta.scale ){
      //   object.scale.x = meta.scale.x;
      //   object.scale.y = meta.scale.y;
      //   object.scale.z = meta.scale.z;
      // }
      
      object.userData = meta.wpData ? {...object.userData, wpData:meta.wpData} : object.userData;

      avatarGroup.add(object);

		} else {

			parent.children.splice( index, 0, object );
			object.parent = parent;

		}

		this.signals.avatarAdded.dispatch( object );
		this.signals.sceneGraphChanged.dispatch();

	},

	//

	addScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) {

			this.scripts[ object.uuid ] = [];

		}

		this.scripts[ object.uuid ].push( script );

		this.signals.scriptAdded.dispatch( script );

	},

	removeScript: function ( object, script ) {

		if ( this.scripts[ object.uuid ] === undefined ) return;

		var index = this.scripts[ object.uuid ].indexOf( script );

		if ( index !== - 1 ) {

			this.scripts[ object.uuid ].splice( index, 1 );

		}

		this.signals.scriptRemoved.dispatch( script );

	},

	getObjectMaterial: function ( object, slot ) {

		var material = object.material;

		if ( Array.isArray( material ) && slot !== undefined ) {

			material = material[ slot ];

		}

		return material;

	},

	setObjectMaterial: function ( object, slot, newMaterial ) {

		if ( Array.isArray( object.material ) && slot !== undefined ) {

			object.material[ slot ] = newMaterial;

		} else {

			object.material = newMaterial;

		}

	},

	setCameraType: function ( type ) {

		const oldCamera = this.camera;

		const isOrthographic = oldCamera.isOrthographicCamera === true;

		if ( ( type === 'orthographic' && isOrthographic ) || ( type === 'perspective' && ! isOrthographic ) ) return;

		// the orbit point the framing should be preserved around

		const center = this.controls ? this.controls.center : new THREE.Vector3();
		const distance = oldCamera.position.distanceTo( center );

		let newCamera;

		if ( type === 'orthographic' ) {

			const halfSize = _ORTHOGRAPHIC_FRUSTUM_SIZE / 2;
			newCamera = new THREE.OrthographicCamera( - halfSize, halfSize, halfSize, - halfSize, 0, 10000 );
			newCamera.position.copy( oldCamera.position );
			newCamera.quaternion.copy( oldCamera.quaternion );

			// derive the zoom so the orthographic framing matches the perspective view at the orbit center

			const halfFOV = THREE.MathUtils.DEG2RAD * oldCamera.fov / 2;
			newCamera.zoom = ( newCamera.top - newCamera.bottom ) / ( 2 * Math.max( distance, 0.0001 ) * Math.tan( halfFOV ) );

		} else {

			newCamera = new THREE.PerspectiveCamera( 50, 1, 0.001, 1e10 );
			newCamera.quaternion.copy( oldCamera.quaternion );

			// reposition along the view direction so the perspective framing matches the orthographic view

			const halfFOV = THREE.MathUtils.DEG2RAD * newCamera.fov / 2;
			const targetDistance = ( oldCamera.top - oldCamera.bottom ) / ( 2 * oldCamera.zoom * Math.tan( halfFOV ) );

			const offset = new THREE.Vector3().subVectors( oldCamera.position, center );
			if ( offset.lengthSq() === 0 ) offset.set( 0, 0, 1 ).applyQuaternion( oldCamera.quaternion );
			offset.normalize().multiplyScalar( targetDistance );

			newCamera.position.copy( center ).add( offset );

		}

		newCamera.name = oldCamera.name;
		newCamera.uuid = oldCamera.uuid;
		newCamera.updateProjectionMatrix();

		this.camera = newCamera;
		this.cameras[ newCamera.uuid ] = newCamera;

		if ( this.viewportCamera === oldCamera ) this.viewportCamera = newCamera;

		this.signals.cameraResetted.dispatch();

		// keep the selection (and thus the sidebar) in sync with the new camera instance

		if ( this.selected === oldCamera ) this.select( newCamera );

	},

	setViewportCamera: function ( uuid ) {

		this.viewportCamera = this.cameras[ uuid ] || this.camera;
		this.signals.viewportCameraChanged.dispatch();

	},

	setViewportShading: function ( value ) {

		this.viewportShading = value;
		this.signals.viewportShadingChanged.dispatch();

	},

	//

	select: function ( object ) {

		object.selectable && selectable === false ? null: this.selector.select( object );

	},

	selectById: function ( id ) {

		if ( id === this.camera.id ) {

			this.select( this.camera );
			return;

		}

		this.select( this.scene.getObjectById( id ) );

	},

	selectByUuid: function ( uuid ) {

		var scope = this;

		this.scene.traverse( function ( child ) {

			if ( child.uuid === uuid ) {

				scope.select( child );

			}

		} );

	},

	deselect: function () {

		this.selector.deselect();

	},

	focus: function ( object ) {

		if ( object !== undefined ) {

			this.signals.objectFocused.dispatch( object );

		}

	},

	focusById: function ( id ) {

		this.focus( this.scene.getObjectById( id ) );

	},

	clear: function () {

		this.history.clear();
		this.storage.clear();

		this.setCameraType( 'perspective' );
		this.camera.copy( _DEFAULT_CAMERA );
		this.signals.cameraResetted.dispatch();

		this.scene.name = 'Scene';
		this.scene.userData = {};
		this.scene.background = null;
		this.scene.environment = null;
		this.scene.fog = null;

		var objects = this.scene.children;

		this.signals.sceneGraphChanged.active = false;

		while ( objects.length > 0 ) {

			this.removeObject( objects[ 0 ] );
      this.sendMqtt("removeObject", {uuid: object[ 0 ].uuid});

		}

		this.signals.sceneGraphChanged.active = true;

		this.geometries = {};
		this.materials = {};
		this.textures = {};
		this.scripts = {};

		this.materialsRefCounter.clear();

		this.animations = {};
		this.mixer.stopAllAction();

		this.deselect();

		this.backgroundType = 'Default';
		this.environmentType = 'Default';

		this.signals.editorCleared.dispatch();

	},

	//

	fromJSON: async function ( json ) {

		var loader = new THREE.ObjectLoader();
		var camera = await loader.parseAsync( json.camera );

		this.setCameraType( camera.isOrthographicCamera ? 'orthographic' : 'perspective' );

		const existingUuid = this.camera.uuid;
		const incomingUuid = camera.uuid;

		// copy all properties, including uuid
		this.camera.copy( camera );
		this.camera.uuid = incomingUuid;

		delete this.cameras[ existingUuid ]; // remove old entry [existingUuid, this.camera]
		this.cameras[ incomingUuid ] = this.camera; // add new entry [incomingUuid, this.camera]

		if ( json.controls !== undefined ) {

			this.controls.fromJSON( json.controls );

		}

		this.signals.cameraResetted.dispatch();

		this.history.fromJSON( json.history );
		this.scripts = json.scripts;

		const scene = await loader.parseAsync( json.scene );

		this.backgroundType = json.backgroundType || 'Default';
		this.environmentType = json.environmentType || 'Default';

		this.setScene( scene );

	},

	toJSON: function () {

		// scripts clean up

		var scene = this.scene;
		var scripts = this.scripts;

		for ( var key in scripts ) {

			var script = scripts[ key ];

			if ( script.length === 0 || scene.getObjectByProperty( 'uuid', key ) === undefined ) {

				delete scripts[ key ];

			}

		}

		return {

			metadata: {},
			project: {
				renderer: this.config.getKey( 'project/renderer/type' ),
				shadows: this.config.getKey( 'project/renderer/shadows' ),
				shadowType: this.config.getKey( 'project/renderer/shadowType' ),
				toneMapping: this.config.getKey( 'project/renderer/toneMapping' ),
				toneMappingExposure: this.config.getKey( 'project/renderer/toneMappingExposure' )
			},
			camera: this.viewportCamera.toJSON(),
			controls: this.controls.toJSON(),
			scene: this.scene.toJSON(),
			scripts: this.scripts,
			history: this.history.toJSON(),
			backgroundType: this.backgroundType,
			environmentType: this.environmentType

		};

	},

	objectByUuid: function ( uuid ) {

		return this.scene.getObjectByProperty( 'uuid', uuid, true );

	},

	objectByName: function ( name ) {

		return this.scene.getObjectByProperty( 'name', name, true );

	},

	execute: function ( cmd, optionalName ) {

    // console.log("editor.execute ", optionalName);

		this.history.execute( cmd, optionalName );

	},

	undo: function () {

		this.history.undo();

	},

	redo: function () {

		this.history.redo();

	},

  setSendMQTT: function (mqttSendFunction){
    this.sendMQTT = mqttSendFunction;
  },

  sendMqtt: function (commandString, propertyObject){
    this.sendMQTT ? this.sendMQTT(commandString, propertyObject) : console.log('No Mosquitto configured');
  },

	utils: {

		save: save,
		saveArrayBuffer: saveArrayBuffer,
		saveString: saveString,
		formatNumber: formatNumber

	}

};

const link = document.createElement( 'a' );

function save( blob, filename ) {

	if ( link.href ) {

		URL.revokeObjectURL( link.href );

	}

	link.href = URL.createObjectURL( blob );
	link.download = filename || 'data.json';
	link.dispatchEvent( new MouseEvent( 'click' ) );

}

function saveArrayBuffer( buffer, filename ) {

	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}

function saveString( text, filename ) {

	save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

function formatNumber( number ) {

	return new Intl.NumberFormat( 'en-us', { useGrouping: true } ).format( number );

}

export { Editor };
