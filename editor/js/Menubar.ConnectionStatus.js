import { UIPanel, UIButton } from './libs/ui.js';

function MenubarConnectionStatus( mqttConnection ) {

	const container = new UIPanel();
	container.setClass( 'menu' );

  const connectionMsg = {message:'Disconnected'};


	const title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( /*strings.getKey( 'menubar/add' )*/ 'connection' );
	container.add( title );


	const connection = new UIPanel();
	connection.setClass( 'title' );
	connection.setTextContent( /*strings.getKey( 'menubar/add' )*/ connectionMsg.message );
	container.add( connection );

  setInterval(() => {
    mqttConnection.status ? (connectionMsg.message = 'Live') :  (connectionMsg.message = 'Disconnected')
    connection.setTextContent( /*strings.getKey( 'menubar/add' )*/ connectionMsg.message );
  }, 1000);

	return container;

}

export { MenubarConnectionStatus };
