import { UIPanel } from './libs/ui.js';
import { ToolbarButton } from './ToolbarButton.js';
import { ReteGraphWindow } from './ReteGraphWindow.js';

// No dedicated icon asset exists for this toolbar yet (same situation as
// Toolbar.Cameras.js), so inline a simple node-graph glyph.
const RETE_ICON = 'data:image/svg+xml;utf8,' + encodeURIComponent(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6">' +
	'<circle cx="5" cy="6" r="2.2" fill="white" stroke="none"/>' +
	'<circle cx="5" cy="18" r="2.2" fill="white" stroke="none"/>' +
	'<circle cx="19" cy="12" r="2.2" fill="white" stroke="none"/>' +
	'<path d="M7 6 L17 11.3 M7 18 L17 12.7"/>' +
	'</svg>'
);

function ToolbarRete( editor ) {

	const container = new UIPanel();
	container.setId( 'toolbar-rete' );

	const button = new ToolbarButton(
		'Rete Interactions',
		RETE_ICON,
		() => window_.open()
	);
	container.add( button );

	const window_ = new ReteGraphWindow( editor );
	document.body.appendChild( window_.dom );

	return container;

}

export { ToolbarRete };
