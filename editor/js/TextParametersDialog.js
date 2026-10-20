import { UIButton, UICheckbox, UIDiv, UIInput, UINumber, UIRow, UIText } from './libs/ui.js';

// Small modal prompting for the text string + extrude parameters before a
// font is turned into a 3D text mesh, mirroring TextureParametersDialog.js's
// show()/confirm()/cancel() Promise-based pattern.
class TextParametersDialog {

	constructor( editor ) {

		this.strings = editor.strings;

		const dom = new UIDiv();
		dom.setClass( 'Dialog' );
		this.dom = dom.dom;

		const background = new UIDiv();
		background.setClass( 'Dialog-background' );
		background.dom.addEventListener( 'click', () => this.cancel() );
		dom.add( background );

		const content = new UIDiv();
		content.setClass( 'Dialog-content' );
		dom.add( content );

		const titleBar = new UIDiv();
		titleBar.setClass( 'Dialog-title' );
		titleBar.setTextContent( 'Add 3D Text' );
		content.add( titleBar );

		const body = new UIDiv();
		body.setClass( 'Dialog-body' );
		content.add( body );

		this.text = new UIInput( 'Hello' ).setWidth( '200px' );
		body.add( createRow( 'Text', this.text ) );

		this.size = new UINumber( 1 ).setRange( 0.01, 1000 ).setWidth( '80px' );
		body.add( createRow( 'Size', this.size ) );

		this.depth = new UINumber( 0.2 ).setRange( 0, 1000 ).setWidth( '80px' );
		body.add( createRow( 'Depth', this.depth ) );

		this.bevelEnabled = new UICheckbox( false );
		body.add( createRow( 'Bevel', this.bevelEnabled ) );

		const buttonsRow = new UIDiv();
		buttonsRow.setClass( 'Dialog-buttons' );
		body.add( buttonsRow );

		const okButton = new UIButton( this.strings.getKey( 'dialog/ok' ) );
		okButton.setWidth( '80px' );
		okButton.onClick( () => this.confirm() );
		buttonsRow.add( okButton );

		const cancelButton = new UIButton( this.strings.getKey( 'dialog/cancel' ) );
		cancelButton.setWidth( '80px' );
		cancelButton.setMarginLeft( '8px' );
		cancelButton.onClick( () => this.cancel() );
		buttonsRow.add( cancelButton );

		this.resolve = null;
		this.reject = null;

	}

	show() {

		document.body.appendChild( this.dom );

		return new Promise( ( resolve, reject ) => {

			this.resolve = resolve;
			this.reject = reject;

		} );

	}

	confirm() {

		const result = {
			text: this.text.getValue() || 'Hello',
			size: this.size.getValue(),
			depth: this.depth.getValue(),
			bevelEnabled: this.bevelEnabled.getValue(),
		};

		this.dom.remove();

		if ( this.resolve ) this.resolve( result );

	}

	cancel() {

		this.dom.remove();

		if ( this.reject ) this.reject( new Error( '3D text parameters cancelled' ) );

	}

}

function createRow( label, ...inputs ) {

	const row = new UIRow();
	row.add( new UIText( label ).setClass( 'Label' ) );

	for ( const input of inputs ) {

		row.add( input );

	}

	return row;

}

export { TextParametersDialog };
