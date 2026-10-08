
  const sceneToJson = () => {
      const vrModels = [];
      const svgModels = [];
      const wpElements = [];
      const primitives = [];
      const lights = [];
      const groups = [];

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
              imageTexture: model.userData.imageTexture || "",
              texture: model.userData.texture || "",
              videoTexture: model.userData.videoTexture || "",
              colorTexture: model.userData.colorTexture || "",
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
        vrModels, lights, primitives, wpElements, groups
      }
    }

export { sceneToJson };