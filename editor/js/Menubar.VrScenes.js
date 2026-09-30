import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';
import { AddObjectCommand } from './commands/AddObjectCommand.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';
import {ExtrudeMeshFromSvg} from './libs/ExtrudeMeshFromSvg.js';

function MenubarVrScenes( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

  const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/vrScenes' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );
  // New Scene

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/vrScenes/newScene' ) );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} ); 
	options.add( option );

  fetch("/wp-json/wp/v2/vr-scenes?per_page=100")
  .then(vrScenesResult => vrScenesResult.json())
  .then(vrScenesData => {
    vrScenesData.map(vrScene => {

      option = new UIRow();
      option.setClass( 'option' );
      option.setTextContent( decodeURI(vrScene.title.rendered) );
      option.onClick( function () {

        if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

          editor.clear();
          // console.log('Load vr scene '+vrScene.id);

          const color = 0x222222;

          const light = new THREE.AmbientLight( color );
          light.name = 'AmbientLight';

          editor.execute( new AddObjectCommand( editor, light ) );

          fetch("m/wp-json/wp/v2/vr-scenes/"+vrScene.id)
          .then(vrSceneResult => vrSceneResult.json())
          .then(vrSceneData => {
            // console.log("vrSceneData", vrSceneData);
            
            // fetch scene background model

            editor.scene.name = vrSceneData.title.rendered;
            editor.scene.background = new THREE.Color(vrSceneData.acf.skycolor);
            editor.scene.userData = {...editor.scene.userData, wpData:vrSceneData};

            // fetch scene models
            vrSceneData.acf.models.map(vrSceneModel => {
            fetch("/wp-json/wp/v2/vr-model/"+vrSceneModel.vrmodel)
              .then(vrSceneModelResult => vrSceneModelResult.json())
              .then(vrSceneModelData =>{
                // console.log("vrSceneModelData", vrSceneModelData);
                const modelMediaId = vrSceneModelData.acf.model_file || vrSceneModelData.acf.gltf_file || vrSceneModelData.acf.fbx_file
                fetch("/wp-json/wp/v2/media/"+modelMediaId)
                .then(vrSceneGltfResult => vrSceneGltfResult.json())
                .then(vrSceneGltfData => {

                  // console.log("vrSceneGltfData", vrSceneGltfData);
                  fetch(""+vrSceneGltfData.source_url)
                  .then(vrSceneGltfFile => vrSceneGltfFile.blob())
                  .then(vrSceneGltfBlob => {

                    vrSceneGltfBlob.name = ""+vrSceneGltfData.source_url;//.split("/").pop();
                    vrSceneGltfBlob.lastModified = new Date();
                    const loaderResult = editor.loader.loadFiles( [
                      vrSceneGltfBlob], "", 
                      [ {
                          scale:vrSceneModel.scale,
                          position:vrSceneModel.position,
                          rotation:vrSceneModel.rotation,
                          wpData:vrSceneModelData,
                          imageTexture:vrSceneModel.imageTexture || null,
                          texture:vrSceneModel.texture || null,
                          videoTexture:vrSceneModel.videoTexture || null,
                          // name: vrSceneModelData.title.rendered
                      } ]
                    );

                  });

                });
              });
            });

            // fetch svg models
            vrSceneData.acf.svg_models.map(vrSvg => {
              fetch("/wp-json/wp/v2/media/"+vrSvg.svgmodel)
              .then(vrSvgResult => vrSvgResult.json())
              .then(vrSvgData => {
                fetch(""+vrSvgData.source_url)
                .then(vrSvgFile => vrSvgFile.text())
                .then(vrSvgText => {
                  
                  const vrSvgMesh = ExtrudeMeshFromSvg(vrSvgText);
                  vrSvgMesh.name = `${vrSvgData.source_url.split("/").pop()} (SVG)`;
                  editor.execute( new AddObjectAndSetMetaCommand( editor, vrSvgMesh, 
                    {
                      position:vrSvg.position,
                      scale:vrSvg.scale,
                      rotation:vrSvg.rotation,
                      wpData:vrSvgData,
                    },  
                  ));

                });
              });
            });

          });

        }

      } );
      options.add( option );
    })
  })


	/*

	options.add( new UIHorizontalRule() );

  // New Model

	option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/vrScenes/newModel' ) );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

			editor.clear();

		}

	} );
	options.add( option );

	//

	options.add( new UIHorizontalRule() );
*/

	return container;

}

export { MenubarVrScenes };
