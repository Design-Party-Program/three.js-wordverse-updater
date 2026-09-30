class Selector {

	constructor( editor ) {

		const signals = editor.signals;

		this.editor = editor;
		this.signals = signals;

		// signals

		signals.intersectionsDetected.add( ( intersects ) => {

			if ( intersects.length > 0 ) {

				const object = intersects[ 0 ].object;

        //console.log("intersectDetecerted",object, object.parent, object.parent.parent );

        let selectedObjectGroup = object;
        
        while(selectedObjectGroup.parent && selectedObjectGroup.parent.type !== 'Scene' ){
          //console.log("object parent type", selectedObjectGroup, typeof selectedObjectGroup.parent);
          selectedObjectGroup = selectedObjectGroup.parent;
        };

        //console.log("selected group object", selectedObjectGroup);

				if ( selectedObjectGroup !== undefined ) {

					// helper

					this.select( selectedObjectGroup );

				} else if ( object.userData.object !== undefined ) {

					// helper

					this.select( object.userData.object );

				} else {

					this.select( object );

				}

			} else {

				this.select( null );

			}

		} );

	}

	select( object ) {

		if ( this.editor.selected === object ) return;

		let uuid = null;

		if ( object !== null ) {

			uuid = object.uuid;

		}

		this.editor.selected = object;
		this.editor.config.setKey( 'selected', uuid );

		this.signals.objectSelected.dispatch( object );

	}

	deselect() {

		this.select( null );

	}

}

export { Selector };
