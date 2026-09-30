import { UIPanel, UIButton, UICheckbox, UIHorizontalRule  } from './libs/ui.js';
import { ToolbarButton } from './ToolbarButton.js';
//import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';


function ToolbarPrimitives( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass( 'menu' );
	container.setId( 'toolbar-primitives' );

	const title = new ToolbarButton(
    `${strings.getKey( 'menubar/add' ) }`, 
    "images/primitives/noun-3d-models-4110485.svg", 
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

  


	// Test ToolbarButton
  // options.add(new ToolbarButton(
  //   "Test Toolbar Button", "images/test.svg", 
  //   () => {
  //     alert('tut tut');
  //   }
  // ));

  // Primitives ToolbarButton

  // Box Primitive 
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/box' ) } Primitive`, 
    "images/primitives/noun-cube-5615115.svg", 
    () => {
      console.log('add box primitive');
      const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Box';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type:'Box',
          name:'Box',
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Box', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Capsule Primitive 
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/capsule' ) } Primitive`, 
    "images/primitives/noun-capsule-5738184.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/capsule' ) } Primitive`);
      
      const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.name = 'Capsule';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Capsule', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Circle Primitive 
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/circle' ) } Primitive`, 
    "images/primitives/noun-oval-6175643.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/circle' ) } Primitive`);
      
      const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Circle';
      const uuid = THREE.MathUtils.generateUUID();  
     
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {
        uuid:uuid, 
        name:'Circle', 
        wpData: {
          type: "primitive",
          subtype: mesh.name,
        }
      } )
    );
    }
  ));

  // Cylinder Primitive 
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/cylinder' ) } Primitive`, 
    "images/primitives/noun-cylinder-5615113.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/cylinder' ) } Primitive`);
      
      const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Cylinder';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Cylinder', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Dodecahedron Primitve
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/dodecahedron' ) } Primitive`, 
    "images/primitives/noun-dodecahedron-6499788.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/dodecahedron' ) } Primitive`);
      
      const geometry = new THREE.DodecahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Dodecahedron';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Dodecahedron', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Icosahedron Primitve
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/icosahedron' ) } Primitive`, 
    "images/primitives/noun-icosahedron-5738185.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/icosahedron' ) } Primitive`);
      
      const geometry = new THREE.IcosahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Icosahedron';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Icosahedron', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Octahedron Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/octahedron' ) } Primitive`, 
    "images/primitives/noun-octahedron-6499799.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/octahedron' ) } Primitive`);

      const geometry = new THREE.OctahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Octahedron';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Octahedron', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Plane Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/plane' ) } Primitive`, 
    "images/primitives/noun-3d-plane-2539975.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/plane' ) } Primitive`);

      const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.name = 'Plane';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Plane', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Ring Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/ring' ) } Primitive`, 
    "images/primitives/noun-ring-5615093.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/ring' ) } Primitive`);

      const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Ring';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Ring', 
        wpData: {
          type: "primitive",
          subtype: mesh.name,
        }
        } ) );
    }
  ));

  // Sphere Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/sphere' ) } Primitive`, 
    "images/primitives/noun-sphere-5615133.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/sphere' ) } Primitive`);

      const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Sphere';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Sphere', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Sprite Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/sprite' ) } Primitive`, 
    "images/primitives/noun-square-6804669.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/sprite' ) } Primitive`);

      const sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
      sprite.name = 'Sprite';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: sprite.name,
          name: sprite.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, sprite, {uuid:uuid, name:'Sprite', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Tetrahedron Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/tetrahedron' ) } Primitive`, 
    "images/primitives/noun-tetrahedron-5615114.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/tetrahedron' ) } Primitive`);

      const geometry = new THREE.TetrahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Tetrahedron';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Tetrahedron', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Torus Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/torus' ) } Primitive`, 
    "images/primitives/noun-torus-5738177.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/torus' ) } Primitive`);

      const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Torus';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Torus', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );  
    }
  ));

  // TorusKnot Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/torusknot' ) } Primitive`, 
    "images/primitives/noun-solid-torus-knot-605721.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/torusknot' ) } Primitive`);

      const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'TorusKnot';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Torusknot', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // Tube Primitive
  options.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/tube' ) } Primitive`, 
    "images/primitives/noun-tube-4211920.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/tube' ) } Primitive`);

      const path = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( 2, 2, - 2 ),
        new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
        new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
        new THREE.Vector3( - 2, 2, 2 )
      ] );
  
      const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Tube';
      const uuid = THREE.MathUtils.generateUUID();
  
      // send mqtt message to collaborators
      editor.sendMqtt(
        "addPrimitive", 
        {
          type: mesh.name,
          name: mesh.name,
          uuid: uuid,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:uuid, name:'Tube', 
      wpData: {
        type: "primitive",
        subtype: mesh.name,
      }} ) );
    }
  ));

  // add a seperator rule
	//container.add( new UIHorizontalRule() );

	// signals.transformModeChanged.add( function ( mode ) {

	// 	translate.dom.classList.remove( 'selected' );
	// 	rotate.dom.classList.remove( 'selected' );
	// 	scale.dom.classList.remove( 'selected' );

	// 	switch ( mode ) {

	// 		case 'translate': translate.dom.classList.add( 'selected' ); break;
	// 		case 'rotate': rotate.dom.classList.add( 'selected' ); break;
	// 		case 'scale': scale.dom.classList.add( 'selected' ); break;

	// 	}

	// } );

	return container;

}

export { ToolbarPrimitives };
