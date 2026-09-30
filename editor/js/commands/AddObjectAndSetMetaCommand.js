import { Command } from '../Command.js';
import { ObjectLoader } from 'three';

/**
 * @param editor Editor
 * @param object THREE.Object3D
 * @constructor
 */
class AddObjectAndSetMetaCommand extends Command {

	constructor( editor, object, meta ) {

		super( editor );
		this.type = 'AddObjectAndSetMetaCommand';

		this.object = object;
		if ( object !== undefined ) {

			this.name = `Add Object and set meta: ${object.name}`;

		}
    this.meta = meta;

	}

	execute() {

		//this.editor.addObject( this.object );
		this.editor.addObjectAndSetMeta( this.object, this.meta );
		this.editor.select( this.object );

	}

	undo() {

		this.editor.removeObject( this.object );
		this.editor.deselect();

	}

	toJSON() {

		const output = super.toJSON( this );

		output.object = this.object.toJSON();

		return output;

	}

	fromJSON( json ) {

		super.fromJSON( json );

		this.object = this.editor.objectByUuid( json.object.object.uuid );

		if ( this.object === undefined ) {

			const loader = new ObjectLoader();
			this.object = loader.parse( json.object );

		}

	}

}

export { AddObjectAndSetMetaCommand };
