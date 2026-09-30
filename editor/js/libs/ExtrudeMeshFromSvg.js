import * as THREE from 'three'; 
import {SVGLoader} from './../../../examples/jsm/loaders/SVGLoader.js';


export const ExtrudeMeshFromSvg = (SvgFile) => {

  console.log(SvgFile);

  let mesh;



  let shapes = [];

  const loader = new SVGLoader();
  const svgData = loader.parse(SvgFile);
  var svgMeshGroup = new THREE.Group();


  svgData.paths.forEach((path, i) => {
    shapes = path.toShapes(true);

    shapes.forEach((shape, i) => {
      // console.log("adding svg shape to mesh group", path, shape, i);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 20,
        bevelEnabled: false
      });
      const material = new THREE.MeshBasicMaterial({ 
        color: path.color, 
        opacity: path.userData.style.fillOpacity,
				side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, 0);
  
      svgMeshGroup.add(mesh);
    });
  });


  //mesh.rotation.y += 0.01;
  console.log('extrudeSvgMesh', svgMeshGroup);
  svgMeshGroup.scale.set(0.01,0.01,0.01)
  svgMeshGroup.scale.y *= -1;

  const returnGroup = new THREE.Group();
  returnGroup.add(svgMeshGroup);
  return returnGroup;
}



