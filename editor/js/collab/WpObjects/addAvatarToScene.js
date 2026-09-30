
import { AddObjectAndSetMetaCommand } from './../../commands/AddObjectAndSetMetaCommand.js';

const addAvatarToScene = async (modelId, userData, editor) => {

  const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
  const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );

 

  const colors = [
    {r:173, g:216, b:230 ,a:1} , 
    {r:  0, g:191, b:255 ,a:1} , 
    {r: 30, g:144, b:255 ,a:1} , 
    {r:  0, g:  0, b:255 ,a:1} , 
    {r:  0, g:  0, b:139 ,a:1} , 
    {r: 72, g: 61, b:139 ,a:1} , 
    {r:123, g:104, b:238 ,a:1} , 
    {r:138, g: 43, b:226 ,a:1} , 
    {r:128, g:  0, b:128 ,a:1} , 
    {r:218, g:112, b:214 ,a:1} , 
    {r:255, g:  0, b:255 ,a:1} , 
    {r:255, g: 20, b:147 ,a:1} , 
    {r:176, g: 48, b: 96 ,a:1} , 
    {r:220, g: 20, b: 60 ,a:1} , 
    {r:240, g:128, b:128 ,a:1} , 
    {r:255, g: 69, b:  0 ,a:1} , 
    {r:255, g:165, b:  0 ,a:1} , 
    {r:244, g:164, b: 96 ,a:1} , 
    {r:240, g:230, b:140 ,a:1} , 
    {r:128, g:128, b:  0 ,a:1} , 
    {r:139, g:69,  b:19 ,a:1} , 
    {r:255, g:255, b:  0 ,a:1} , 
    {r:154, g:205, b: 50 ,a:1} , 
    {r:124, g:252, b:  0 ,a:1} , 
    {r:144, g:238, b:144 ,a:1} , 
    {r:143, g:188, b:143 ,a:1} , 
    {r: 34, g:139, b: 34 ,a:1} , 
    {r:  0, g:255, b:127 ,a:1} , 
    {r:  0, g:255, b:255 ,a:1} , 
    {r:  0, g:139, b:139 ,a:1} , 
    {r:128, g:128, b:128 ,a:1} , 
    {r:255, g:255, b:255 ,a:1}
  ];
  //const myScene = new THREE.Scene();
  
  const group = new THREE.Group();
  const textSprite = makeTextSprite(
    userData.name,
    {
      backgroundColor: colors[ Math.floor( Math.random() * colors.length ) ],
      fontsize: 16
    }
  );
  group.add(textSprite);
  textSprite.position.set(-2, 0, 1);
  // textSprite.scale.set(.5, 1, 1);
  group.name = 'User Camera';
  group.add(mesh);
  
  editor.execute(new AddObjectAndSetMetaCommand( editor, group, {
    uuid: userData.instance,
    selectable: false,
  }));

  await fetch("/wp-json/wp/v2/vr-model/"+modelId)
  .then(modelResult => modelResult.json())
  .then(modelData => {
    // console.log("modelData",modelData);
    const modelMediaId = modelData.acf.model_file || modelData.acf.gltf_file || modelData.acf.fbx_file;
    fetch("https://"+window.location.hostname+"/wp-json/wp/v2/media/"+modelMediaId)
    .then(modelGltfResult => modelGltfResult.json())
    .then(modelGltfData => {
      // console.log("modelGltfData", modelGltfData);
      fetch(modelGltfData.source_url)
      .then(modelGltfFile => modelGltfFile.blob())
      .then(modelGltfBlob => {
        modelGltfBlob.name = modelGltfData.source_url;
        modelGltfBlob.lastModified = new Date();
        // editor.removeObject(editor.objectByUuid(modelInstanceUUID));
        
        editor.loader.loadAvatars( 
          [modelGltfBlob], 
          "https://wordverse.designpartyprogram.nl", 
          [{
            position:{x:100,y:100,z:100},
            scale:{
              x:modelData.acf.scale, 
              y:modelData.acf.scale, 
              z:modelData.acf.scale
            },
            rotation:{x:0,y:0,z:0},
            wpData: modelData,
            uuid: userData.instance
          }]
        );
        return true;
      });
    });
  });
}

function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ? parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ? parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ? parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        console.log("canvas font metrics", metrics);
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
        context.lineWidth = borderThickness;
        context.beginPath();
        context.roundRect(borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);
        context.fill();
        context.stroke();

        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness * 2, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial( { map: texture, useScreenCoordinates: false } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
    }



export { addAvatarToScene };