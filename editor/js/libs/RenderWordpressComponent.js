function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function RenderWordpressComponent(prop, editor, meta){
  console.log('render wp comp content', prop);
  if(!prop.content || prop.content == "" || prop.content.length && prop.content.length == 0){
    console.log('no content, dont render');
    return new Promise( (resolve) => {
      return resolve(false);
    });
  }

  if(meta.component_type === "image" || prop.data_selector === "featured_image"){
    console.log('content is image');
    return RenderWordpressMediaComponent(prop, editor, meta);
  }

  console.log("imagelist content test", prop.data_selector.substring(0, 10));
  if(meta.component_type === "image-list" || prop.data_selector.substring(0, 10) === "acf.slides"){
    console.log('content is image list');
    return RenderWordpressMediaListComponent(prop, editor, meta);
  }

  if(meta.component_type === "categories" || prop.data_selector === "categories"){
    console.log('content is image');
    return RenderWordpressMediaComponent(prop, editor, meta);
  }

  if(meta.component_type === "acf.product" || prop.data_selector === "acf.product"){
    console.log('content is acf.product');
    return RenderWordpressTextComponent(prop, editor, meta);
  }

  if(Array.isArray(prop.content)){
    console.log('content is array');
    return RenderWordpressMediaListComponent(prop, editor, meta)
  }

  if(typeof prop.content == "number"){
    console.log('content is number');
    return RenderWordpressMediaComponent(prop, editor, meta)
  }

  const filenameCheck = prop.content.substring(prop.content.length-4, prop.content.length)
  if(filenameCheck === '.svg' || filenameCheck === '.jpg' || filenameCheck === '.png' || filenameCheck === '.gif'){
    return RenderWordpressMediaComponent(prop, editor, meta)
  }else{
    return RenderWordpressTextComponent(prop, editor, meta)
  }
}

function RenderWordpressMediaComponent(prop, editor, meta){
  console.log("content render a file thing", prop);
  let object3d = null;
  return fetch("/wp-json/wp/v2/media/"+prop.content)
  .then(wpMediaResult => wpMediaResult.json())
  .then(wpMediaData => {

    if(wpMediaData.source_url.substring(wpMediaData.source_url.length-4,wpMediaData.source_url.length ).toLowerCase() === '.svg'){

      fetch( ""+wpMediaData.source_url )
      .then( vrSvgFile => vrSvgFile.text())
      .then( vrSvgText => {
        
        object3d = ExtrudeMeshFromSvg(vrSvgText);
        object3d.name = `${vrSvgData.source_url.split("/").pop()} (SVG)`;

      });
      meta.wpData.componentType = `svg-image`;

    }else{
      // console.log("vrSceneGltfData", vrSceneGltfData);

      const canvasMaterial = new THREE.MeshPhongMaterial({
        map:  new THREE.TextureLoader().load(""+wpMediaData.source_url),
      });


      let params ={
        bendDepth: 4
      }

      let geom = new THREE.PlaneGeometry(16, 9, 20, 20);
      planeCurve(geom, params.bendDepth);
      object3d = new THREE.Mesh(geom, canvasMaterial);
      meta.wpData.componentType = `image`;
    }

    //editor.execute( new AddObjectAndSetMetaCommand( editor, object3d, meta ) );
    return { mesh: object3d, meta: meta };
  });
 //let gui = new GUI();
  // gui.add(mat, "wireframe");
  // gui.add(params, "bendDepth", 1, 20).name("bend depth").onChange(v => {
  //   planeCurve(geom, v);
  // })

  function planeCurve(g, z){
    
    let p = g.parameters;
    let hw = p.width * 0.5;
    
    let a = new THREE.Vector2(-hw, 0);
    let b = new THREE.Vector2(0, z);
    let c = new THREE.Vector2(hw, 0);
    
    let ab = new THREE.Vector2().subVectors(a, b);
    let bc = new THREE.Vector2().subVectors(b, c);
    let ac = new THREE.Vector2().subVectors(a, c);
    
    let r = (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));
    
    let center = new THREE.Vector2(0, z - r);
    let baseV = new THREE.Vector2().subVectors(a, center);
    let baseAngle = baseV.angle() - (Math.PI * 0.5);
    let arc = baseAngle * 2;
    
    let uv = g.attributes.uv;
    let pos = g.attributes.position;
    let mainV = new THREE.Vector2();
    for (let i = 0; i < uv.count; i++){
      let uvRatio = 1 - uv.getX(i);
      let y = pos.getY(i);
      mainV.copy(c).rotateAround(center, (arc * uvRatio));
      pos.setXYZ(i, mainV.x, y, -mainV.y);
    }
    
    pos.needsUpdate = true;
    
  }
}



function RenderWordpressMediaListComponent(prop, editor, meta){
  console.log("content render a slide-list thing", prop);
  const displayGroup = new THREE.Group();
  const slideGroup = new THREE.Group();

  return Promise.all(
    prop.content.map((slide, index) => {
      return fetch("/wp-json/wp/v2/media/"+slide.slide)
      .then(wpMediaResult => wpMediaResult.json())
      .then(function (wpMediaData){
    
        // console.log("vrSceneGltfData", vrSceneGltfData);
        const imageListSize = .8;
        // const canvasMaterial = new THREE.MeshPhongMaterial({
        //   map:  new THREE.TextureLoader().load(""+wpMediaData.source_url),
        // });

        const canvasMaterial = new THREE.MeshPhongMaterial({
          map:  new THREE.TextureLoader().load(""+wpMediaData.source_url),
        });
      
        let geom = new THREE.PlaneGeometry(
          imageListSize, 
          wpMediaData.media_details.height * (imageListSize / wpMediaData.media_details.width),
        );
        let mesh = new THREE.Mesh(geom, canvasMaterial);
        mesh.material.transparent = true;
        slideGroup.add(mesh);
        mesh.position.x = imageListSize * index;
        //mesh.position.z = 0.004 * index;
        mesh.position.y = 0 - wpMediaData.media_details.height * (imageListSize / wpMediaData.media_details.width) / 2;
        return true;
      });
    })
  ).then(()=>{
    meta.wpData.componentType = `image-list`;
  
    const geometry = new THREE.BoxGeometry( .8*10, .02, 2, );
    const material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    const maskBox = new THREE.Mesh(geometry, material);
    maskBox.rotation.x = Math.PI / 2;
    maskBox.position.x = .8*5.5;
    maskBox.position.y = -.48;
    maskBox.position.z = .01;
    maskBox.material.transparent = true;
    maskBox.material.opacity = 0;
    maskBox.renderOrder = -1;
  
    displayGroup.add(slideGroup);
    displayGroup.add(maskBox);
  
    return { mesh: displayGroup, meta: meta };
  })
};



function RenderWordpressTextComponent(prop, editor, meta){
  const uuid = uuidv4();
	const backgroundColor = editor.scene.background.getHexString();
  const htmlContent = document.createElement( `div` );
  htmlContent.id =  `postContent-${uuid}`;
  htmlContent.style=`
    font-family:sans-serif;
    display: inline-block;
    font-size: 36px;
    line-height: 54px;
    min-width: 40px;
    width: auto;
    max-width: calc( 720px + 48px );
    min-height: 54px;
    /* height: 720px; */
    background: #${backgroundColor};
    ${meta.wpData.customCss}
  `;
	console.log('renderWordpressCompeonts', prop.content);
  htmlContent.innerHTML = prop.content;
            
	document.body.appendChild(htmlContent);

  const htmlCanvas = document.createElement( `div` );
  htmlCanvas.id =  `postCanvas-${uuid}`;
  document.body.appendChild(htmlCanvas);

  const group = new THREE.Group();
  group.name=prop.name;

  return html2canvas(document.querySelector(`#postContent-${uuid}`))
  .then(canvas => {
            
    document.getElementById(`postCanvas-${uuid}`).appendChild(canvas);

    const texture = new THREE.CanvasTexture(canvas);
    const canvasMaterial = new THREE.MeshPhongMaterial({
      //	map: loader.load('resources/images/wall.jpg'),
        map: texture,
    });

    const colorMaterial = new THREE.MeshPhongMaterial({color:"#"+backgroundColor});

    const frontside = new THREE.Group();
    let radius = .025;
    let width = canvas.width/1200 + radius; let height = canvas.height/1200 + radius;
    let x = width/-2; let y = height/-2;

    let shape = new THREE.Shape();
    shape.moveTo( x, y + radius );
    shape.lineTo( x, y + height - radius );
    shape.quadraticCurveTo( x, y + height, x + radius, y + height );
    shape.lineTo( x + width - radius, y + height );
    shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
    shape.lineTo( x + width, y + radius );
    shape.quadraticCurveTo( x + width, y, x + width - radius, y );
    shape.lineTo( x + radius, y );
    shape.quadraticCurveTo( x, y, x, y + radius );

    let billboardGeometry = new THREE.ShapeBufferGeometry( shape );
    let billboardMesh = new THREE.Mesh(billboardGeometry, colorMaterial);

    const contentGeometry = new THREE.PlaneGeometry( width- (2 * radius), height - (2 * radius) );
    const contentMesh = new THREE.Mesh(contentGeometry, canvasMaterial);
    contentMesh.position.z = .002;
    frontside.add(billboardMesh);
    frontside.add(contentMesh);
    group.add(frontside);
    frontside.position.y = height/-2;
    const backside = frontside.clone();
    group.add(backside);
    const rotation = new THREE.Vector3(0,1,0);
    backside.rotateOnAxis( rotation.normalize(), 180 * Math.PI / 180 );

    document.getElementById(`postContent-${uuid}`).remove();
    
    meta.wpData.componentType = `text`;
    return  {mesh:group, meta:meta };
    
	});
}

export {RenderWordpressComponent};