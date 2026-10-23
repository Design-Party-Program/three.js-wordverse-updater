// Hand-written re-implementation of rete.js's official "Scopes" plugin concept
// (https://github.com/retejs/scopes-plugin) - NOT a vendored copy of that package's
// code. That package is CC-BY-NC-SA-4.0 (non-commercial) licensed, materially more
// restrictive than the MIT-licensed rete/area-plugin/connection-plugin core already
// vendored in rete-bundle.js. This file reproduces the same end-user UX (long-press a
// node, release it over another node to nest it; the parent auto-resizes/repositions
// to visually bound its children; dragging a parent carries its children along) as
// original code against that same MIT core's public API - Scope, BaseAreaPlugin,
// node views, the 'nodepicked'/'nodetranslated'/'nodedragged'/'noderemoved' area-pipe
// events, area.update() - all pre-existing core AreaPlugin functionality, nothing the
// official plugin itself invented.
//
// "Nesting" here is purely a DATA relationship (node.parent = <containing node's id>)
// plus a VISUAL illusion: a parent node's own `width`/`height` are grown to bound its
// children's positions (see resizeParent()), and ReteGraphRenderer.js applies those as
// an explicit CSS box when present (see renderNodeBody()'s node.width/height check) -
// child nodes stay independent top-level views in the area's content holder, not real
// DOM descendants of the parent's container, so no change to how sockets/connections
// render was needed.

import { Scope, BaseAreaPlugin, NodeEditor } from './rete-bundle.js';

const DEFAULT_PADDING = { top: 40, left: 20, right: 20, bottom: 20 };

function getNodesBoundingBox( nodes, area ) {
	const boxes = nodes.map( ( node ) => {
		const view = area.nodeViews.get( node.id );
		if ( ! view ) throw new Error( 'rete-scopes: missing node view for ' + node.id );
		return { position: view.position, width: node.width || 0, height: node.height || 0 };
	} );
	const left = Math.min( ...boxes.map( ( b ) => b.position.x ) );
	const right = Math.max( ...boxes.map( ( b ) => b.position.x + b.width ) );
	const top = Math.min( ...boxes.map( ( b ) => b.position.y ) );
	const bottom = Math.max( ...boxes.map( ( b ) => b.position.y + b.height ) );
	return { top, left, right, bottom, width: right - left, height: bottom - top };
}

// Sets the parent's own box size from its children's bounding box (or a minimal empty
// size if it has none) and repositions it so that box + padding still contains them -
// then recurses upward in case the parent is itself nested in another scope.
async function resizeParent( editor, area, parent, agentParams ) {
	const { padding, exclude, translate } = agentParams;
	const children = editor.getNodes().filter( ( n ) => n.parent === parent.id && ! exclude( n.id ) );
	const pad = padding( parent.id );

	if ( ! children.length ) {
		parent.width = pad.left + pad.right;
		parent.height = pad.top + pad.bottom;
		await area.update( 'node', parent.id );
	} else {
		const box = getNodesBoundingBox( children, area );
		parent.width = box.width + pad.left + pad.right;
		parent.height = box.height + pad.top + pad.bottom;
		await area.update( 'node', parent.id );
		await translate( parent.id, box.left - pad.left, box.top - pad.top );
	}
	// Covers both branches above uniformly - a position change (the "has children"
	// branch's translate()) already fires its own real 'nodetranslated' naturally, but a
	// width/height-only change (nothing moved) wouldn't otherwise notify anything that a
	// save is needed - re-emitting the same event shape either way is harmless and
	// guarantees ReteGraphWindow.js's persist-on-nodetranslated listener always catches it.
	await notifyChanged( area, parent.id );

	if ( parent.parent ) {
		const parentsParent = editor.getNode( parent.parent );
		if ( parentsParent ) await resizeParent( editor, area, parentsParent, agentParams );
	}
}

// Width/height-only changes (e.g. a scope shrinking to empty) don't move the node, so
// no real 'nodetranslated' event fires on its own - re-emit that same shape purely so
// ReteGraphWindow.js's existing persist-on-nodetranslated listener also saves it.
async function notifyChanged( area, id ) {
	const view = area.nodeViews.get( id );
	if ( view ) await area.emit( { type: 'nodetranslated', data: { id, position: view.position, previous: view.position } } );
}

// Moves every direct child of `id` by the same delta the parent itself just moved by -
// skips children that are themselves mid-drag (selected) so a multi-select drag of a
// parent + some of its own children doesn't double-move those children.
async function translateChildren( editor, area, id, position, previous ) {
	const dx = position.x - previous.x;
	const dy = position.y - previous.y;
	if ( ! dx && ! dy ) return;
	const children = editor.getNodes().filter( ( n ) => n.parent === id );
	await Promise.all( children.map( async ( n ) => {
		if ( n.selected ) return;
		const view = area.nodeViews.get( n.id );
		if ( ! view ) return;
		await view.translate( view.position.x + dx, view.position.y + dy );
	} ) );
}

function belongsTo( editor, nodeId, ids ) {
	if ( ids.includes( nodeId ) ) return true;
	const node = editor.getNode( nodeId );
	if ( ! node || ! node.parent ) return false;
	return belongsTo( editor, node.parent, ids );
}

function hasSelectedParent( editor, nodeId ) {
	const node = editor.getNode( nodeId );
	if ( ! node || ! node.parent ) return false;
	const parent = editor.getNode( node.parent );
	if ( ! parent ) return false;
	return !! parent.selected || hasSelectedParent( editor, node.parent );
}

// Finds whichever OTHER node is topmost (by DOM paint order) under `pointer` and
// reassigns `ids`' parent to it (or clears their parent if the drop misses every
// node), then resizes whichever old/new parent(s) are affected.
async function reassignParent( editor, area, ids, pointer, agentParams ) {
	if ( ! ids.length ) return;
	const nodes = ids.map( ( id ) => editor.getNode( id ) ).filter( Boolean );
	const holderChildren = Array.from( area.area.content.holder.childNodes );

	const overlay = editor.getNodes()
		.filter( ( n ) => ! ids.includes( n.id ) )
		.map( ( n ) => ( { node: n, view: area.nodeViews.get( n.id ) } ) )
		.filter( ( entry ) => !! entry.view )
		.filter( ( { node, view } ) =>
			pointer.x > view.position.x && pointer.y > view.position.y &&
			pointer.x < view.position.x + ( node.width || 0 ) && pointer.y < view.position.y + ( node.height || 0 )
		)
		.map( ( entry ) => Object.assign( entry, { index: holderChildren.indexOf( entry.view.element ) } ) )
		.sort( ( a, b ) => b.index - a.index );

	const target = overlay[ 0 ];
	const formerParents = nodes
		.map( ( n ) => n.parent )
		.filter( Boolean )
		.map( ( id ) => editor.getNode( id ) )
		.filter( Boolean );

	nodes.forEach( ( n ) => { n.parent = undefined; } );

	if ( target ) {
		nodes.forEach( ( n ) => { n.parent = target.node.id; } );
		await resizeParent( editor, area, target.node, agentParams );
	}

	for ( const formerParent of formerParents ) {
		await resizeParent( editor, area, formerParent, agentParams );
	}
}

// Guards translateChildren()'s own view.translate() calls against re-entering
// resizeParent()'s translate() for the SAME node id in the same tick.
function trackedTranslate( area ) {
	const active = new Map();
	return {
		async translate( id, x, y ) {
			const view = area.nodeViews.get( id );
			if ( ! view ) throw new Error( 'rete-scopes: cannot find node view for ' + id );
			const previous = view.position;
			if ( previous.x === x && previous.y === y ) return;
			active.set( id, ( active.get( id ) || 0 ) + 1 );
			await view.translate( x, y );
			active.set( id, ( active.get( id ) || 0 ) - 1 );
		},
		isTranslating( id ) {
			return ( active.get( id ) || 0 ) > 0;
		},
	};
}

// Keeps a freshly-picked-up node (and any connections touching it) painted above
// everything else while it's being dragged, same visual convention as the official
// plugin - otherwise a node dragged over a bigger scope box would render underneath it.
function bringForward( editor, area, nodeId ) {
	const view = area.nodeViews.get( nodeId );
	const content = area.area.content;
	editor.getConnections()
		.filter( ( c ) => c.source === nodeId || c.target === nodeId )
		.forEach( ( c ) => {
			const cView = area.connectionViews.get( c.id );
			if ( cView ) content.reorder( cView.element, content.holder.firstChild );
		} );
	if ( view ) content.reorder( view.element, null );
	editor.getNodes().filter( ( n ) => n.parent === nodeId ).forEach( ( child ) => bringForward( editor, area, child.id ) );
}

/**
 * Hand-written equivalent of rete.js's official Scopes plugin - lets a node have a
 * `parent` (another node's id) so loop-type nodes (midi-pair-loop, group-set) can have
 * their per-iteration body defined by visually nesting sink nodes inside them, instead
 * of tagging each one via a dropdown. Long-press a node (or a multi-selection),
 * release it over another node to nest/un-nest it.
 */
class ScopesPlugin extends Scope {

	constructor( props ) {
		super( 'scopes' );
		this.padding = ( props && props.padding ) || ( () => DEFAULT_PADDING );
		this.exclude = ( props && props.exclude ) || ( () => false );
		this.longPressMs = ( props && props.longPressMs ) || 250;
		this._pickTimeout = null;
		this._candidates = [];
	}

	setParent( scope ) {
		super.setParent( scope );
		this.area = this.parentScope( BaseAreaPlugin );
		this.editor = this.area.parentScope( NodeEditor );

		const { translate, isTranslating } = trackedTranslate( this.area );
		this._agentParams = { padding: this.padding, exclude: this.exclude, translate };

		this._wireDragAndDrop();
		this._wireAutoResize( isTranslating );
	}

	_cancelPick() {
		if ( this._pickTimeout !== null ) {
			window.clearTimeout( this._pickTimeout );
			this._pickTimeout = null;
		}
	}

	_releasePick() {
		const list = this._candidates.slice();
		this._cancelPick();
		this._candidates = [];
		return list;
	}

	_wireDragAndDrop() {
		const editor = this.editor;
		const area = this.area;
		const agentParams = this._agentParams;

		this.area.addPipe( async ( context ) => {
			if ( ! context || typeof context !== 'object' || ! ( 'type' in context ) ) return context;

			if ( context.type === 'nodepicked' ) {
				bringForward( editor, area, context.data.id );
				const id = context.data.id;
				this._pickTimeout = window.setTimeout( () => {
					const selected = editor.getNodes().filter( ( n ) => n.selected );
					this._candidates = selected.length ? selected.map( ( n ) => n.id ) : [ id ];
				}, this.longPressMs );
			}

			if ( context.type === 'nodetranslated' ) {
				this._cancelPick();
			}

			if ( context.type === 'nodedragged' ) {
				const pointer = area.area.pointer;
				const ids = this._releasePick();
				if ( ids.length ) {
					await reassignParent( editor, area, ids, pointer, agentParams );
					// Parent reassignment is a pure data mutation (no position change, so
					// no real 'nodetranslated' fires) - re-emit that same event shape purely
					// so ReteGraphWindow.js's existing persist-on-nodetranslated listener
					// also saves this change, without needing its own scopes-aware wiring.
					ids.forEach( ( id ) => {
						const view = area.nodeViews.get( id );
						if ( view ) area.emit( { type: 'nodetranslated', data: { id, position: view.position, previous: view.position } } );
					} );
				}
			}

			if ( context.type === 'connectioncreated' ) {
				const connection = editor.getConnection( context.data.id );
				if ( connection ) {
					bringForward( editor, area, connection.source );
					bringForward( editor, area, connection.target );
				}
			}

			return context;
		} );
	}

	_wireAutoResize( isTranslating ) {
		const editor = this.editor;
		const area = this.area;
		const agentParams = this._agentParams;

		this.addPipe( async ( context ) => {
			if ( context.type === 'nodetranslated' ) {
				const { id, position, previous } = context.data;
				const current = editor.getNode( id );
				if ( ! current ) return context;

				if ( ! isTranslating( id ) ) await translateChildren( editor, area, id, position, previous );

				const parent = current.parent ? editor.getNode( current.parent ) : null;
				if ( parent && ! agentParams.exclude( id ) ) {
					// A drag that's actively moving this node's own (selected) parent, or
					// this node as part of a scope-reassignment in progress, will trigger
					// its own resize once it settles - don't fight it mid-drag.
					const settling = hasSelectedParent( editor, id ) || belongsTo( editor, id, this._candidates );
					if ( ! settling ) await resizeParent( editor, area, parent, agentParams );
				}
			}

			if ( context.type === 'noderemoved' ) {
				const parentId = context.data.parent;
				const parent = parentId && editor.getNode( parentId );
				if ( parent ) await resizeParent( editor, area, parent, agentParams );
			}

			return context;
		} );
	}

	/** Recomputes a scope's box from its CURRENT children - call after programmatically
	 * adding/removing/loading nodes (e.g. loading a saved graph), outside of any drag. */
	async update( scopeId ) {
		const node = this.editor.getNode( scopeId );
		if ( ! node ) return;
		await resizeParent( this.editor, this.area, node, this._agentParams );
	}

}

export { ScopesPlugin };
