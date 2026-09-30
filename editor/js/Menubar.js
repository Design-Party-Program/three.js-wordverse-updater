import { UIPanel } from './libs/ui.js';
import { MenubarAdd } from './Menubar.Add.js';
import { MenubarModels } from './Menubar.Models.js';
import { MenubarEdit } from './Menubar.Edit.js';
// import { MenubarFile } from './Menubar.File.js';
// import { MenubarExamples } from './Menubar.Examples.js';
import { MenubarView } from './Menubar.View.js';
// import { MenubarHelp } from './Menubar.Help.js';
// import { MenubarPlay } from './Menubar.Play.js';
import { MenubarSave} from './Menubar.Save.js';
// import { MenubarVrScenes } from './Menubar.VrScenes.js';
// import { MenubarStatus } from './Menubar.Status.js';
import { MenubarViewButtons} from './Menubar.View.buttons.js';
import { MenubarSaveButtons} from './Menubar.Save.buttons.js';
import { MenubarWordpressComponents } from './Menubar.WordpressComponents.js';
import { MenubarSvg } from './Menubar.Svg.js';
import { MenubarConnectionStatus } from './Menubar.ConnectionStatus.js';
function Menubar( editor, mqttConnection ) {

	const container = new UIPanel();
	container.setId( 'menubar' );

	// container.add( new MenubarVrScenes( editor ) );
	// container.add( new MenubarSave( editor ) );
	container.add( new MenubarSaveButtons( editor ) );

  // add a button for save / upload with picture: images/controls/Font_Awesome_5_solid_cloud-upload-alt
	
  // container.add( new MenubarEdit( editor ) );
	// container.add( new MenubarFile( editor ) );
	// container.add( new MenubarAdd( editor ) );
	container.add( new MenubarSvg( editor ) );
	//container.add( new MenubarWordpressComponents( editor ) );
	container.add( new MenubarModels( editor ) );
	container.add( new MenubarViewButtons( editor ) );
	//container.add( new MenubarPlay( editor ) );
	//container.add( new MenubarExamples( editor ) );
	//container.add( new MenubarView( editor ) );
	// container.add( new MenubarHelp( editor ) );
	// container.add( new MenubarStatus( editor ) );
  container.add( new MenubarConnectionStatus( mqttConnection ) );
  

	return container;

}

export { Menubar };
