import { UIPanel, UIButton } from './libs/ui.js';

function MenubarSaveButtons( editor ) {

	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );



  const saveIcon = document.createElement( 'img' );
  saveIcon.title = strings.getKey( 'toolbar/fullscreen' );
  saveIcon.src = 'images/controls/Font_Awesome_5_solid_cloud-upload-alt.svg';


  const save = new UIButton();
  save.dom.className = 'Button';
  save.dom.appendChild(saveIcon );



	save.onClick( function () {
		console.log(editor.scene);        
    if ( confirm( `Save scene "${editor.scene.name}"?` ) ) {
      const sceneData = editor.scene.userData.wpData;
      const vrModels = [];
      const svgModels = [];
      const wpElements = [];
      const primitives = [];
      const lights = [];
      const groups = [];
      const cameras = [];

      // Pull texture fields from the model root, or from any descendant where they were set.
      const _pickTexture = ( model, key ) => {
        if ( model.userData && model.userData[ key ] ) return model.userData[ key ];
        let found = "";
        model.traverse( child => {
          if ( ! found && child !== model && child.userData && child.userData[ key ] ) {
            found = child.userData[ key ];
          }
        } );
        return found;
      };

      // the uuid of the immediate parent Ctrl+G group, or "" if top-level
      const _groupUuidOf = ( model ) =>
        ( model.parent && model.parent.userData && model.parent.userData.wvIsGroupContainer ) ? model.parent.uuid : "";

      const walk = ( model ) => {

        if ( model.userData && model.userData.wvIsGroupContainer ) {
          groups.push( {
            uuid: model.uuid,
            name: model.name,
            position: model.position,
            scale: model.scale,
            rotation: {
              x: model.rotation._x,
              y: model.rotation._y,
              z: model.rotation._z
            },
          } );
          model.children.forEach( walk );
          return;
        }

        if ( model.isCamera ) {
          cameras.push( {
            uuid: model.uuid,
            name: model.name,
            position: model.position,
            rotation: {
              x: model.rotation._x,
              y: model.rotation._y,
              z: model.rotation._z
            },
            fov: model.fov,
            near: model.near,
            far: model.far,
            is_default: !! model.userData.wvIsDefaultCamera,
            group_uuid: _groupUuidOf( model ),
          } );
          return;
        }

        // compile a query and send it to the api

        if( model.userData.wpData ){
        // filter out all models, and add them and their spatial data to the models acf field

          if (model.userData.wpData.type === "vr-model"){
            vrModels.push({
              vrmodel:model.userData.wpData.id,
              uuid:model.uuid,
              name:model.name,
              position:model.position,
              scale:model.scale,
              rotation:{
                x:model.rotation._x,
                y:model.rotation._y,
                z:model.rotation._z
              },
              imageTexture: _pickTexture( model, 'imageTexture' ),
              texture: _pickTexture( model, 'texture' ),
              videoTexture: _pickTexture( model, 'videoTexture' ),
              color_texture: _pickTexture( model, 'colorTexture' ),
              scene_texture: _pickTexture( model, 'sceneTexture' ),
              group_uuid: _groupUuidOf( model ),
            });
          }

          if ( model.userData.wpData.type === "primitive" ){ 
            console.log( "primitive object save", model, model.position, model.position.x );
            primitives.push( {
              name: model.name,
              uuid: model.uuid,
              type: model.userData.wpData.subtype,
              position: model.position,
              scale: model.scale,
              rotation:{
                x: model.rotation._x,
                y: model.rotation._y,
                z: model.rotation._z
              },
              imageTexture: _pickTexture( model, 'imageTexture' ),
              texture: _pickTexture( model, 'texture' ),
              videoTexture: _pickTexture( model, 'videoTexture' ),
              color_texture: _pickTexture( model, 'colorTexture' ),
              scene_texture: _pickTexture( model, 'sceneTexture' ),
              group_uuid: _groupUuidOf( model ),
            } )
          }

          if ( model.userData.wpData.type === "light" ){ 
            console.log( "light content save", model, model.position, model.position.x );
            lights.push( {
              name: model.name,
              uuid: model.uuid,
              type: model.userData.wpData.subtype,
              position: model.position,
              scale: model.scale,
              rotation:{
                x: model.rotation._x,
                y: model.rotation._y,
                z: model.rotation._z
              },
              group_uuid: _groupUuidOf( model ),
            } )
          }

          if (model.userData.wpData.type === "attachment" && model.userData.wpData.mime_type === "image/svg+xml" ){
            console.log("found an svg!");
            svgModels.push({
              svgmodel:model.userData.wpData.id,
              uuid:model.uuid,
              name:model.name,
              position:model.position,
              scale:model.scale,
              rotation:{
                x:model.rotation._x,
                y:model.rotation._y,
                z:model.rotation._z
              },
              imageTexture: _pickTexture( model, 'imageTexture' ),
              texture: _pickTexture( model, 'texture' ),
              videoTexture: _pickTexture( model, 'videoTexture' ),
              color_texture: _pickTexture( model, 'colorTexture' ),
              scene_texture: _pickTexture( model, 'sceneTexture' ),
              group_uuid: _groupUuidOf( model ),
            });
          }

          if ( model.userData.wpData.type === "wordpress-component" ){ 
            console.log( "wp comp content save", model, model.position, model.position.x );
            wpElements.push( {
              component_type: model.userData.wpData.componentType,
              data_selector: model.userData.wpData.data_selector,
              position: model.position,
              scale: model.scale,
              rotation:{
                x: model.rotation._x,
                y: model.rotation._y,
                z: model.rotation._z
              },
              group_uuid: _groupUuidOf( model ),
            } )

          }

        }

      };

      editor.scene.children.forEach( walk );
      console.log(sceneData, vrModels, wpElements);


      // update the wordpress post object

      console.log("POST SUBMITTER", parent.POST_SUBMITTER); 

      fetch(
        `/wp-json/wp/v2/vr-scenes/${sceneData.id}`, //
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: new Headers({
            'Content-Type': 'application/json;charset=UTF-8',
            'X-WP-Nonce' : parent.POST_SUBMITTER.nonce
          }),
          body: JSON.stringify({
            ID: sceneData.id,
            title: editor.scene.name,
            status: "publish",
            acf:{
              scale:1,
              models: vrModels,
              wp_elements: wpElements,
              svg_models: svgModels,
              primitives: primitives,
              lights: lights,
              groups: groups,
              cameras: cameras,
              skycolor: `#${editor.scene.background.getHexString()}`
            }
          }),
        }
      ).then(response => {
        console.log(response);
        return response.json();
      });
    }

	} );
	container.add( save );

	// VR (Work in progress)

	// if ( 'xr' in navigator ) {

	// 	navigator.xr.isSessionSupported( 'immersive-vr' )
	// 		.then( function ( supported ) {

	// 			if ( supported ) {

	// 				const option = new UIRow();
	// 				option.setClass( 'option' );
	// 				option.setTextContent( 'VR' );
	// 				option.onClick( function () {

	// 					editor.signals.toggleVR.dispatch();

	// 				} );
	// 				options.add( option );

	// 			}

	// 		} );

	// }

	return container;

}

export { MenubarSaveButtons };
