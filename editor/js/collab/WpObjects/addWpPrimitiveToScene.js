import { AddObjectAndSetMetaCommand } from './../../../js/commands/AddObjectAndSetMetaCommand.js';

const addWpPrimitiveToScene = async (primitiveType, primitiveInstanceUUID, editor) => {            
  
  if(primitiveType==="Box"){

    const geometry = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Capsule"){

    const geometry = new THREE.CapsuleGeometry( 1, 1, 4, 8 );
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh( geometry, material );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Circle"){

    const geometry = new THREE.CircleGeometry( 1, 32, 0, Math.PI * 2 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Cylinder"){

    const geometry = new THREE.CylinderGeometry( 1, 1, 1, 32, 1, false, 0, Math.PI * 2 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Dodecahedron"){

    const geometry = new THREE.DodecahedronGeometry( 1, 0 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Icosahedron"){

    const geometry = new THREE.IcosahedronGeometry( 1, 0 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Octahedron"){

    const geometry = new THREE.OctahedronGeometry( 1, 0 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  
  }else if(primitiveType==="Ring"){

    const geometry = new THREE.RingGeometry( 0.5, 1, 32, 1, 0, Math.PI * 2 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Plane"){

    const geometry = new THREE.PlaneGeometry( 1, 1, 1, 1 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Sphere"){

    const geometry = new THREE.SphereGeometry( 1, 32, 16, 0, Math.PI * 2, 0, Math.PI );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Sprite"){

    const mesh = new THREE.Sprite( new THREE.SpriteMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Tetrahedron"){

    const geometry = new THREE.TetrahedronGeometry( 1, 0 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Torus"){

    const geometry = new THREE.TorusGeometry( 1, 0.4, 12, 48, Math.PI * 2 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="TorusKnot"){

    const geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8, 2, 3 );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else if(primitiveType==="Tube"){

    const path = new THREE.CatmullRomCurve3( [
      new THREE.Vector3( 2, 2, - 2 ),
      new THREE.Vector3( 2, - 2, - 0.6666666666666667 ),
      new THREE.Vector3( - 2, - 2, 0.6666666666666667 ),
      new THREE.Vector3( - 2, 2, 2 )
    ] );

    const geometry = new THREE.TubeGeometry( path, 64, 1, 8, false );
    const mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
    mesh.name = primitiveType;
    try {
      editor.execute( new AddObjectAndSetMetaCommand( editor, mesh, {uuid:primitiveInstanceUUID, name:primitiveType} ) );
    }
    catch (err){
      console.log(err);
    }

  }else{
    console.log(`No action taken for MQTT message "${arrMessageObj.message}"`, arrMessageObj);
  }
}

export { addWpPrimitiveToScene };