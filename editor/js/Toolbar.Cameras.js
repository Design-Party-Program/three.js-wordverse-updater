import { UIPanel } from './libs/ui.js';
import { ToolbarButton } from './ToolbarButton.js';
import { AddObjectAndSetMetaCommand } from './commands/AddObjectAndSetMetaCommand.js';

// No dedicated icon asset exists for this toolbar yet, so inline a simple glyph.
const CAMERA_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">' +
  '<path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>' +
  '<circle cx="12" cy="13" r="3.5" fill="#222"/>' +
  '</svg>'
);

function ToolbarCameras( editor ) {

  const strings = editor.strings;

  const container = new UIPanel();
  container.setClass( 'menu' );
  container.setId( 'toolbar-cameras' );

  const title = new ToolbarButton(
    `${strings.getKey( 'menubar/add' ) }`,
    CAMERA_ICON,
    () => {
      console.log('no click, just hover babee');
    }
  );
  title.setClass( 'title' );
  container.add( title );

  const options = new UIPanel();
  options.setClass( 'options' );
  container.add( options );

  // Perspective Camera
  options.add(new ToolbarButton(
    'Perspective Camera',
    CAMERA_ICON,
    () => {
      const camera = new THREE.PerspectiveCamera();
      camera.name = 'PerspectiveCamera';
      const uuid = THREE.MathUtils.generateUUID();

      // send mqtt message to collaborators
      editor.sendMqtt(
        "addCamera",
        {
          name: camera.name,
          uuid: uuid,
          fov: camera.fov,
          near: camera.near,
          far: camera.far,
        }
      );
      editor.execute( new AddObjectAndSetMetaCommand( editor, camera, { uuid: uuid, name: camera.name } ) );
    }
  ));

  return container;

}

export { ToolbarCameras };
