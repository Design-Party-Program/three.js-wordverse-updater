import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';
import { AddObjectCommand } from './commands/AddObjectCommand.js';

function MenubarModels( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

  const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/models' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );
  // New Scene

	let option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/models/newModel' ) );
	option.onClick( function () {

		if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {

      document.location.href="/wp-admin/post-new.php?post_type=vr-model";

		}

	} ); 
	options.add( option );

  const parentParams = new URLSearchParams( parent.window.location.search );
  const sceneId = parentParams.get( 'vr_post_id' ) || '';
  const nonce = ( parent.POST_SUBMITTER && parent.POST_SUBMITTER.nonce ) ? parent.POST_SUBMITTER.nonce : '';
  // Use the plugin slug injected by PHP (serve_editor_frame) so the REST
  // namespace matches the actual plugin directory name. This lets a test
  // deployment installed under a different folder run side-by-side with
  // the production copy without clashing on REST routes.
  const pluginSlug = ( typeof window !== 'undefined' && window.WORDVERSE_PLUGIN_SLUG ) ? window.WORDVERSE_PLUGIN_SLUG : 'wordverse';
  const modelsUrl = '/wp-json/' + pluginSlug + '/v1/scene-models' + ( sceneId ? '?scene_id=' + encodeURIComponent( sceneId ) : '' );

  fetch( modelsUrl, {
    credentials: 'same-origin',
    headers: nonce ? { 'X-WP-Nonce': nonce } : {}
  } )
  .then(modelsResult => modelsResult.json())
  .then(modelsData => {
    modelsData.map(model => {

      option = new UIRow();
      option.setClass( 'option' );
      option.setTextContent( decodeURI(model.title.rendered) );
      option.onClick( function () {

        if ( confirm( `Add model "${model.title.rendered}" to scene?` ) ) {

          // const color = 0x222222;

          // const light = new THREE.AmbientLight( color );
          // light.name = 'AmbientLight';

          //editor.execute( new AddObjectCommand( editor, light ) );
          const uuid = THREE.MathUtils.generateUUID();
          editor.sendMqtt(
            "addModel", 
            {
              modelId: model.id,
              uuid: uuid,
            }
          );
          fetch("/wp-json/wp/v2/vr-model/"+model.id)
          .then(modelResult => modelResult.json())
          .then(modelData => {
            
            console.log("modelData",modelData);
            const modelMediaId = modelData.acf.model_file || modelData.acf.gltf_file || modelData.acf.fbx_file;
            fetch("https://"+window.location.hostname+"/wp-json/wp/v2/media/"+modelMediaId)
            .then(modelGltfResult => modelGltfResult.json())
            .then(modelGltfData => {
              console.log("modelGltfData", modelGltfData);
              fetch(modelGltfData.source_url)
              .then(modelGltfFile => modelGltfFile.blob())
              .then(modelGltfBlob => {
                modelGltfBlob.name = modelGltfData.source_url;//.split("/").pop();
                modelGltfBlob.lastModified = new Date();
                const loaderResult = editor.loader.loadFiles( [modelGltfBlob], "https://wordverse.designpartyprogram.nl", 
                [ {
                    position:{x:0,y:0,z:0},
                    scale:{
                      x:modelData.acf.scale, 
                      y:modelData.acf.scale, 
                      z:modelData.acf.scale
                    },
                    rotation:{x:0,y:0,z:0},
                    wpData:modelData,
                    uuid:uuid
                  },  
                ])

                console.log("loaderResult", loaderResult);
                //.then(model => {
                /*   model.position.x = modelModel.position_x;
                  model.position.y = modelModel.position_y;
                  model.position.z = modelModel.position_z;
                });*/
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
	option.setTextContent( strings.getKey( 'menubar/models/newModel' ) );
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

export { MenubarModels };
