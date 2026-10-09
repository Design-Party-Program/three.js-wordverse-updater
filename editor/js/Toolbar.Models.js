import { UIPanel, UIButton, UICheckbox, UIHorizontalRule  } from './libs/ui.js';
import { ToolbarButton } from './ToolbarButton.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';


function ToolbarModels( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );
	container.setId( 'toolbar-lights' );

	const title = new ToolbarButton(
    `${strings.getKey( 'menubar/add' ) }`, 
    "images/lights/noun-stage-lights-4803940.svg", 
    () => {
      console.log('no click, just hover babee');
    }
  );
	title.setClass( 'title' );
	// title.setTextContent( strings.getKey( 'menubar/add' ) ); // TODO strings.getKey( 'menubar/add/primitives' )
	container.add( title );

	const options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );


  // Lights ToolbarButton

  // AmbientLight
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/ambientlight' ) }`, 
    "images/lights/noun-ambient-light-4797323.svg", 
    () => {
      console.log('add ambient light');

      const color = 0xffffff;
      const light = new THREE.AmbientLight( color );
      light.name = 'AmbientLight';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addLight", 
        {
          type: light.name,
          name: light.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:uuid, name:light.name} ) );
    }
  ));

  // DirectionalLight
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/directionallight' ) }`, 
    "images/lights/noun-spotlight-1053767.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/directionallight' ) }`);
      
      const color = 0xffffff;
      const intensity = 1;

      const light = new THREE.DirectionalLight( color, intensity );
      light.name = 'DirectionalLight';
      light.target.name = 'DirectionalLight Target';

      light.position.set( 5, 10, 7.5 );
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addLight", 
        {
          type: light.name,
          name: light.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:uuid, name:light.name} ) );
    }
  ));

	// HemisphereLight
  options.add(new ToolbarButton(
    `${strings.getKey('menubar/add/hemispherelight' )}`, 
    "images/lights/noun-hemisphere-1761649.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/hemispherelight' )}`);
      
      const skyColor = 0x00aaff;
      const groundColor = 0xffaa00;
      const intensity = 1;

      const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
      light.name = 'HemisphereLight';

      light.position.set( 0, 10, 0 );
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addLight", 
        {
          type: light.name,
          name: light.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:uuid, name:light.name} ) );
    }
  ));

  // PointLight
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/pointlight' )}`, 
    "images/lights/noun-light-bulb-104790.svg", 
    () => {
      console.log( `add ${strings.getKey(  'menubar/add/pointlight' )}`);
      
      const color = 0xffffff;
      const intensity = 1;
      const distance = 0;

      const light = new THREE.PointLight( color, intensity, distance );
      light.name = 'PointLight';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addLight", 
        {
          type: light.name,
          name: light.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:uuid, name:light.name} ) );
    }
  ));

  // SpotLight
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/spotlight' )}`, 
    "images/lights/noun-spotlight-2714715.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/spotlight' )}`);
      
      
      const color = 0xffffff;
      const intensity = 1;
      const distance = 0;
      const angle = Math.PI * 0.1;
      const penumbra = 0;

      const light = new THREE.SpotLight( color, intensity, distance, angle, penumbra );
      light.name = 'SpotLight';
      light.target.name = 'SpotLight Target';

      light.position.set( 5, 10, 7.5 );
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addLight", 
        {
          type: light.name,
          name: light.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, light, {uuid:uuid, name:light.name} ) );
    }
  ));


  // add a seperator rule
	container.add( new UIHorizontalRule() );

	// signals.transformModeChanged.add( function ( mode ) {

	// 	translate.dom.classList.remove( 'selected' );
	// 	rotate.dom.classList.remove( 'selected' );
	// 	scale.dom.classList.remove( 'selected' );

	// 	switch ( mode ) {

	// 		case 'translate': translate.dom.classList.add( 'selected' ); break;
	// 		case 'rotate': rotate.dom.classList.add( 'selected' ); break;
	// 		case 'scale': scale.dom.classList.add( 'selected' ); break;

	// 	}

	// } );*/

	return container;

}

export { ToolbarModels };
