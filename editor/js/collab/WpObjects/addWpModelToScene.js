
import { AddObjectAndSetMetaCommand } from './../../commands/AddObjectAndSetMetaCommand.js';

const addWpModelToScene = async (modelId, modelInstanceUUID, editor) => {

  const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
  const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
  editor.execute(new AddObjectAndSetMetaCommand( editor, mesh, {
    uuid: modelInstanceUUID
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
        editor.removeObject(editor.objectByUuid(modelInstanceUUID));
        editor.loader.loadFiles( 
          [modelGltfBlob], 
          "https://wordverse.designpartyprogram.nl", 
          [{
            position:{x:0,y:0,z:0},
            scale:{
              x:modelData.acf.scale, 
              y:modelData.acf.scale, 
              z:modelData.acf.scale
            },
            rotation:{x:0,y:0,z:0},
            wpData:modelData,
            uuid: modelInstanceUUID
          }]
        );
        return true;
      });
    });
  });
}

export { addWpModelToScene };