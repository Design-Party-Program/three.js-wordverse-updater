
import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';
import {ExtrudeMeshFromSvg} from './libs/ExtrudeMeshFromSvg.js';


function MenubarSvg( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );

  const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( strings.getKey( 'menubar/3dsvg' ) );
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );
  // New Scene

	let option = new UIRow();
	option.setClass( 'option' );
	// option.setTextContent( strings.getKey( 'menubar/svg/newSvg' ) );
	// option.onClick( function () {

	// 	if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {


	// 	}

	// } ); 
	// options.add( option );

  fetch("/wp-json/wp/v2/media?per_page=100&search=.svg")
  .then(svgResult => svgResult.json())
  .then(svgData => {
    svgData.map(svg => {

      option = new UIRow();
      option.setClass( 'option' );
      option.setTextContent( decodeURI(svg.title.rendered) );
      option.onClick( function () {

        if ( confirm( `Add SVG "${svg.title.rendered}" to scene?` ) ) {

          const color = 0x222222;

            console.log("SVG",svgData);
            const modelMediaId = svg.id;
            fetch("/wp-json/wp/v2/media/"+modelMediaId)
            .then(svgFileResult => svgFileResult.json())
            .then(svgFileData => {
              console.log("svgFileData", svgFileData);
              fetch(""+svgFileData.source_url)
              .then(svgFileFile => svgFileFile.text())
              .then(svgFileText => {
                const svgMesh = ExtrudeMeshFromSvg(svgFileText);
                svgMesh.name = `${svgFileData.source_url.split("/").pop()} (SVG)`;
                editor.execute( new AddObjectAndSetMetaCommand( editor, svgMesh, 
                    {
                      position:{x:0,y:0,z:0},
                      scale:{x:1, y:1, z:1},
                      rotation:{x:0,y:0,z:0},
                      wpData:svgFileData,
                    },  
                  ));
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

export { MenubarSvg };
