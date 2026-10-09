import { AddObjectAndSetMetaCommand } from './../../../js/commands/AddObjectAndSetMetaCommand.js';

const addWpLightToScene = async (lightType, lightInstanceUUID, editor) => {            
  
  if(lightType==="AmbientLight"){

    const color = 0xffffff;
    const light = new THREE.AmbientLight( color );
    light.name = lightType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:lightInstanceUUID, name:lightType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(lightType==="DirectionalLight"){

    const color = 0xffffff;
    const intensity = 1;

    const light = new THREE.DirectionalLight( color, intensity );

    light.position.set( 5, 10, 7.5 );
    light.name = lightType;
    light.target.name = 'DirectionalLight Target';
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:lightInstanceUUID, name:lightType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(lightType==="HemisphereLight"){

    const skyColor = 0x00aaff;
    const groundColor = 0xffaa00;
    const intensity = 1;

    const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );

    light.position.set( 0, 10, 0 );

    light.name = lightType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:lightInstanceUUID, name:lightType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(lightType==="PointLight"){


    const color = 0xffffff;
    const intensity = 1;
    const distance = 0;

    const light = new THREE.PointLight( color, intensity, distance );

    light.name = lightType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:lightInstanceUUID, name:lightType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(lightType==="SpotLight"){

    const color = 0xffffff;
    const intensity = 1;
    const distance = 0;
    const angle = Math.PI * 0.1;
    const penumbra = 0;

    const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
    light.target.name = 'SpotLight Target';

    light.name = lightType;
    light.position.set( 5, 10, 7.5 );
    
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:lightInstanceUUID, name:lightType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else{
    console.log(`No action taken for MQTT message "${arrMessageObj.message}"`, arrMessageObj);
  }
}

export { addWpLightToScene };