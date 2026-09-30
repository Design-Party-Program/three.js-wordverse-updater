
import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';
import {RenderWordpressComponent} from './libs/RenderWordpressComponent.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';

function MenubarWordpressComponents( editor ) {

	const parentUrlParams = new URLSearchParams(parent.window.location.search);
  const vrPostType = parentUrlParams.get('vr_post_type');

  if(vrPostType){

    const signals = editor.signals;
    const strings = editor.strings;
    
    const container = new UIPanel();
    container.setClass( 'menu' );

    const title = new UIPanel();
    title.setClass( 'title' );
    title.setTextContent( strings.getKey( 'menubar/wpcomponents' ) );
    container.add( title );

    const options = new UIPanel();
    options.setClass( 'options' );
    container.add( options );
    // New Scene

    let option = new UIRow();
    option.setClass( 'option' );


    console.log('add wp components');
    fetch(`/wp-json/wp/v2/${vrPostType}/?per_page=100&status=publish`)
    .then(postsResult => postsResult.json())
    .then(postsData => {
      const postListData = postsData[ Math.floor(Math.random() * postsData.length) ]
      const contentElements = [];
      for (var prop in postListData) {
        if (Object.prototype.hasOwnProperty.call(postListData, prop) && (
          prop != 'id' &&
          prop != 'date' &&
          prop != 'guid' &&
          prop != 'modified' &&
          prop != 'status' &&
          prop != 'type' &&
          prop != 'template' &&
          prop != '_links' 
        )) {
          if(prop === 'title' || prop === 'content' || prop === 'excerpt' ){
            contentElements.push({
              name:prop,
              data_selector:`${prop}.rendered`,
              content:postListData[prop].rendered
            });
          }else if(prop === 'acf' ){
            for (var acfProp in postListData.acf) {
              contentElements.push({
                name:acfProp,
                data_selector:`acf.${acfProp}`,
                content:postListData[prop][acfProp]
              });
            }
          }else{
          contentElements.push({
            name:prop,
            data_selector:prop,
            content:postListData[prop]
          });
        }
      }
    }
    
    contentElements.map( prop =>{
      console.log("Add to menu",prop.name, prop.content);
      const content = `${prop.content}`;
      option = new UIRow();
      option.setClass( 'option' );
      option.setTextContent( `Add ${prop.name}` );
      option.onClick(function (e) {
        console.log( "Add to scene",prop.name, prop.content );
        return RenderWordpressComponent( prop, editor, {
          position:{x:0,y:0,z:0},
          scale:{x:1, y:1, z:1},
          rotation:{x:0,y:0,z:0},
          wpData:{
            type: `wordpress-component`,
            name: prop.name,
            data_selector: prop.data_selector,
          },
        }).then((wpComponent)=>{
          editor.execute( new AddObjectAndSetMetaCommand( editor, wpComponent.mesh, wpComponent.meta ) );
        })
        
      });
      options.add(option);
      })
    })
    
    return container;
  }else{
    return false;
  }
}

export { MenubarWordpressComponents };
