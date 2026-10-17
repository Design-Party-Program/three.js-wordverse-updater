
  const sceneToJson = () => {
      const vrModels = [];
      const svgModels = [];
      const wpElements = [];
      const primitives = [];
      const lights = [];
      const groups = [];
      const cameras = [];

      // the uuid of the immediate parent Ctrl+G group, or "" if top-level
      const _groupUuidOf = ( model ) =>
        ( model.parent && model.parent.userData && model.parent.userData.wvIsGroupContainer ) ? model.parent.uuid : "";

      // See Menubar.Save.buttons.js for why this reuses the existing properties_json field.
      const _serializeLightProperties = ( model ) => {
        const props = {};
        if ( model.color ) props.color = '#' + model.color.getHexString();
        if ( model.groundColor ) props.groundColor = '#' + model.groundColor.getHexString();
        if ( model.intensity !== undefined ) props.intensity = model.intensity;
        if ( model.distance !== undefined ) props.distance = model.distance;
        if ( model.angle !== undefined ) props.angle = model.angle;
        if ( model.penumbra !== undefined ) props.penumbra = model.penumbra;
        if ( model.decay !== undefined ) props.decay = model.decay;
        if ( model.castShadow !== undefined ) props.castShadow = model.castShadow;
        return JSON.stringify( props );
      };

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
            // A group's own texture overrides every member's texture (r3f player)
            imageTexture: model.userData.imageTexture || "",
            texture: model.userData.texture || "",
            videoTexture: model.userData.videoTexture || "",
            colorTexture: model.userData.colorTexture || "",
            sceneTexture: model.userData.sceneTexture || "",
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
              imageTexture: model.userData.imageTexture || "",
              texture: model.userData.texture || "",
              videoTexture: model.userData.videoTexture || "",
              colorTexture: model.userData.colorTexture || "",
              sceneTexture: model.userData.sceneTexture || "",
              group_uuid: _groupUuidOf( model ),
              useAnimations: !! model.userData.useAnimations,
              audio_ambient: model.userData.audio_ambient ?? null,
              audio_trigger_s: model.userData.audio_trigger_s ?? null,
              audio_trigger_m: model.userData.audio_trigger_m ?? null,
              audio_trigger_l: model.userData.audio_trigger_l ?? null,
              audio_trigger_xl: model.userData.audio_trigger_xl ?? null,
              audio_trigger_volume: model.userData.audio_trigger_volume ?? 100,
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
              imageTexture: model.userData.imageTexture || "",
              texture: model.userData.texture || "",
              videoTexture: model.userData.videoTexture || "",
              colorTexture: model.userData.colorTexture || "",
              sceneTexture: model.userData.sceneTexture || "",
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
              properties_json: _serializeLightProperties( model ),
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
      console.log(vrModels, lights, primitives, wpElements, groups);
      return {
        vrModels, lights, primitives, wpElements, groups, cameras,
        timeline: editor.scene.userData.timeline || { duration: 10, nodes: [], bases: {} },
        reteGraph: editor.scene.userData.reteGraph || { version: 1, nodes: [], connections: [] },
      }
    }

export { sceneToJson };