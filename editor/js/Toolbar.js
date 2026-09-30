import { UIPanel, UIButton, UICheckbox, UIHorizontalRule  } from './libs/ui.js';
import { ToolbarButton } from './ToolbarButton.js';
import { ToolbarPrimitives } from './Toolbar.Primitives.js';
import { ToolbarLights } from './Toolbar.Lights.js';
import { AddObjectCommand } from './commands/AddObjectCommand.js';


function Toolbar( editor ) {

	const signals = editor.signals;
	const strings = editor.strings;

	const container = new UIPanel();
	container.setId( 'toolbar' );


  // Primitives ToolbarButton
  container.add(new ToolbarPrimitives(editor));

  // Lights ToolbarButton
  container.add(new ToolbarLights(editor));

  // add a seperator rule
	container.add( new UIHorizontalRule() );

	// translate / rotate / scale

	const translateIcon = document.createElement( 'img' );
	translateIcon.title = strings.getKey( 'toolbar/translate' );
	translateIcon.src = 'images/translate.svg';

	const translate = new UIButton();
	translate.dom.className = 'Button selected';
	translate.dom.appendChild( translateIcon );
	translate.onClick( function () {

		signals.transformModeChanged.dispatch( 'translate' );

	} );
	container.add( translate );

	const rotateIcon = document.createElement( 'img' );
	rotateIcon.title = strings.getKey( 'toolbar/rotate' );
	rotateIcon.src = 'images/rotate.svg';

	const rotate = new UIButton();
	rotate.dom.appendChild( rotateIcon );
	rotate.onClick( function () {

		signals.transformModeChanged.dispatch( 'rotate' );

	} );
	container.add( rotate );

	const scaleIcon = document.createElement( 'img' );
	scaleIcon.title = strings.getKey( 'toolbar/scale' );
	scaleIcon.src = 'images/scale.svg';

	const scale = new UIButton();
	scale.dom.appendChild( scaleIcon );
	scale.onClick( function () {

		signals.transformModeChanged.dispatch( 'scale' );

	} );
	container.add( scale );

	const local = new UICheckbox( false );
	local.dom.title = strings.getKey( 'toolbar/local' );
	local.onChange( function () {

		signals.spaceChanged.dispatch( this.getValue() === true ? 'local' : 'world' );

	} );
	container.add( local );

	// Test ToolbarButton
  // container.add(new ToolbarButton(
  //   "Test Toolbar Button", "images/test.svg", 
  //   () => {
  //     alert('tut tut');
  //   }
  // ));


  /*

  // Box Primitive 
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/box' ) } Primitive`, 
    "images/primitives/noun-cube-5615115.svg", 
    () => {
      console.log('add box primitive');

      const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Box';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Capsule Primitive 
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/capsule' ) } Primitive`, 
    "images/primitives/noun-capsule-5738184.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/capsule' ) } Primitive`);
      
      const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.name = 'Capsule';

      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Circle Primitive 
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/circle' ) } Primitive`, 
    "images/primitives/noun-oval-6175643.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/circle' ) } Primitive`);
      
      const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Circle';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Cylinder Primitive 
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/cylinder' ) } Primitive`, 
    "images/primitives/noun-cylinder-5615113.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/cylinder' ) } Primitive`);
      
      const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Cylinder';

      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Dodecahedron Primitve
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/dodecahedron' ) } Primitive`, 
    "images/primitives/noun-dodecahedron-6499788.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/dodecahedron' ) } Primitive`);
      
      const geometry = new THREE.DodecahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Dodecahedron';

      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Icosahedron Primitve
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/icosahedron' ) } Primitive`, 
    "images/primitives/noun-icosahedron-5738185.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/icosahedron' ) } Primitive`);
      
      const geometry = new THREE.IcosahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Icosahedron';

      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Octahedron Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/octahedron' ) } Primitive`, 
    "images/primitives/noun-octahedron-6499799.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/octahedron' ) } Primitive`);

      const geometry = new THREE.OctahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Octahedron';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Plane Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/plane' ) } Primitive`, 
    "images/primitives/noun-3d-plane-2539975.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/plane' ) } Primitive`);

      const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh( geometry, material );
      mesh.name = 'Plane';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Ring Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/ring' ) } Primitive`, 
    "images/primitives/noun-ring-5615093.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/ring' ) } Primitive`);

      const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Ring';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Sphere Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/sphere' ) } Primitive`, 
    "images/primitives/noun-sphere-5615133.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/sphere' ) } Primitive`);

      const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Sphere';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Sprite Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/sprite' ) } Primitive`, 
    "images/primitives/noun-square-6804669.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/sprite' ) } Primitive`);

      const sprite = new THREE.Sprite( new THREE.SpriteMaterial() );
      sprite.name = 'Sprite';
  
      editor.execute( new AddObjectCommand( editor, sprite ) );
    }
  ));

  // Tetrahedron Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/tetrahedron' ) } Primitive`, 
    "images/primitives/noun-tetrahedron-5615114.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/tetrahedron' ) } Primitive`);

      const geometry = new THREE.TetrahedronGeometry( 1, 0 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Tetrahedron';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Torus Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/torus' ) } Primitive`, 
    "images/primitives/noun-torus-5738177.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/torus' ) } Primitive`);

      const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'Torus';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );  
    }
  ));

  // TorusKnot Primitive
  container.add(new ToolbarButton(
    `${strings.getKey( 'menubar/add/torusknot' ) } Primitive`, 
    "images/primitives/noun-solid-torus-knot-605721.svg", 
    () => {
      console.log( `add ${strings.getKey( 'menubar/add/torusknot' ) } Primitive`);

      const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
      const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
      mesh.name = 'TorusKnot';
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // Tube Primitive
  container.add(new ToolbarButton(
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
  
      editor.execute( new AddObjectCommand( editor, mesh ) );
    }
  ));

  // add a seperator rule
	container.add( new UIHorizontalRule() );
  */

	signals.transformModeChanged.add( function ( mode ) {

		translate.dom.classList.remove( 'selected' );
		rotate.dom.classList.remove( 'selected' );
		scale.dom.classList.remove( 'selected' );

		switch ( mode ) {

			case 'translate': translate.dom.classList.add( 'selected' ); break;
			case 'rotate': rotate.dom.classList.add( 'selected' ); break;
			case 'scale': scale.dom.classList.add( 'selected' ); break;

		}

	} );

	return container;

}

export { Toolbar };
