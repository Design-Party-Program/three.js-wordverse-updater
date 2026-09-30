import { UIButton } from './libs/ui.js';

function ToolbarButton( title, src, clickFunction ) {
	// translate / rotate / scale

	const toolbarIcon = document.createElement( 'img' );
	toolbarIcon.title = title;
	toolbarIcon.src = src;

	const toolbarButton = new UIButton();
	toolbarButton.dom.appendChild( toolbarIcon  );
	toolbarButton.onClick( clickFunction );
  

	return toolbarButton;

}

export { ToolbarButton };
