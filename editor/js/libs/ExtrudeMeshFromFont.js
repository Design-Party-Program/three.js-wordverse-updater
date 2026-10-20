import * as THREE from 'three';
import { TTFLoader } from './../../../examples/jsm/loaders/TTFLoader.js';
import { Font } from './../../../examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from './../../../examples/jsm/geometries/TextGeometry.js';

// Mirrors ExtrudeMeshFromSvg.js: takes a raw TTF/OTF ArrayBuffer + a text
// string and returns a THREE.Group of extruded letter meshes. TTFLoader
// (opentype.js under the hood) converts the font into three.js's typeface
// JSON, which Font/TextGeometry already know how to turn into Shapes +
// ExtrudeGeometry - the exact same family SVG extrusion uses.
export const ExtrudeMeshFromFont = ( fontArrayBuffer, text, {
  size = 1,
  depth = 0.2,
  bevelEnabled = false,
  color = 0x222222,
} = {} ) => {

  const ttfLoader = new TTFLoader();
  const fontJson = ttfLoader.parse( fontArrayBuffer );
  const font = new Font( fontJson );

  const geometry = new TextGeometry( text, {
    font,
    size,
    depth,
    bevelEnabled,
    bevelThickness: 0.02,
    bevelSize: 0.01,
    curveSegments: 6,
  } );
  geometry.computeBoundingBox();
  geometry.center(); // keep the object's own origin at the text's visual center, like other primitives

  const material = new THREE.MeshBasicMaterial( { color, side: THREE.DoubleSide } );
  const mesh = new THREE.Mesh( geometry, material );

  const returnGroup = new THREE.Group();
  returnGroup.add( mesh );
  return returnGroup;
};
