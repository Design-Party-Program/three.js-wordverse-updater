import { addWpModelToScene } from './collab/WpObjects/addWpModelToScene.js';

const PAGE_SIZE = 9;

function decodeHtml( html ) {

	const el = document.createElement( 'div' );
	el.innerHTML = html;
	return el.textContent || '';

}

function getSceneId() {

	const parentParams = new URLSearchParams( parent.window.location.search );
	return parentParams.get( 'vr_post_id' ) || '';

}

function getNonce() {

	return ( parent.POST_SUBMITTER && parent.POST_SUBMITTER.nonce ) ? parent.POST_SUBMITTER.nonce : '';

}

async function fetchModels() {

	const sceneId = getSceneId();
	const url = new URL( '/wp-json/wp/v2/vr-model', window.location.origin );
	url.searchParams.set( 'per_page', '100' );
	url.searchParams.set( 'orderby', 'title' );
	url.searchParams.set( 'order', 'asc' );
	if ( sceneId ) url.searchParams.set( 'scene_id', sceneId );

	const nonce = getNonce();
	const response = await fetch( url.toString(), {
		credentials: 'same-origin',
		headers: nonce ? { 'X-WP-Nonce': nonce } : {}
	} );

	if ( ! response.ok ) throw new Error( `Failed to fetch models (${response.status})` );

	const data = await response.json();
	return data.map( ( model ) => ( {
		id: model.id,
		title: decodeHtml( model.title.rendered ),
		thumbnail: model.thumbnail_url || null,
		tags: model.tag_names || []
	} ) );

}

// simple contains-anywhere ("wildcard") match against name or tags
function matchesQuery( model, query ) {

	if ( ! query ) return true;
	const needle = query.toLowerCase();
	if ( model.title.toLowerCase().includes( needle ) ) return true;
	return model.tags.some( ( tag ) => tag.toLowerCase().includes( needle ) );

}

function openAddModelModal( editor ) {

	let allModels = [];
	let filteredModels = [];
	let currentPage = 1;

	const overlay = document.createElement( 'div' );
	overlay.className = 'wv-model-modal-overlay';

	const modal = document.createElement( 'div' );
	modal.className = 'wv-model-modal';
	overlay.appendChild( modal );

	const header = document.createElement( 'div' );
	header.className = 'wv-model-modal-header';
	modal.appendChild( header );

	const title = document.createElement( 'span' );
	title.className = 'wv-model-modal-title';
	title.textContent = 'Add model to scene';
	header.appendChild( title );

	const closeButton = document.createElement( 'button' );
	closeButton.type = 'button';
	closeButton.className = 'wv-model-modal-close';
	closeButton.textContent = '\u00d7';
	header.appendChild( closeButton );

	const searchInput = document.createElement( 'input' );
	searchInput.type = 'text';
	searchInput.className = 'wv-model-modal-search';
	searchInput.placeholder = 'Search by name or tag\u2026';
	modal.appendChild( searchInput );

	const grid = document.createElement( 'div' );
	grid.className = 'wv-model-modal-grid';
	modal.appendChild( grid );

	const emptyMessage = document.createElement( 'div' );
	emptyMessage.className = 'wv-model-modal-empty';
	emptyMessage.textContent = 'Loading models\u2026';
	modal.appendChild( emptyMessage );

	const pagination = document.createElement( 'div' );
	pagination.className = 'wv-model-modal-pagination';
	modal.appendChild( pagination );

	const prevButton = document.createElement( 'button' );
	prevButton.type = 'button';
	prevButton.className = 'wv-model-modal-page-button';
	prevButton.textContent = '\u2039 Prev';
	pagination.appendChild( prevButton );

	const pageLabel = document.createElement( 'span' );
	pageLabel.className = 'wv-model-modal-page-label';
	pagination.appendChild( pageLabel );

	const nextButton = document.createElement( 'button' );
	nextButton.type = 'button';
	nextButton.className = 'wv-model-modal-page-button';
	nextButton.textContent = 'Next \u203a';
	pagination.appendChild( nextButton );

	const addNewButton = document.createElement( 'button' );
	addNewButton.type = 'button';
	addNewButton.className = 'wv-model-modal-add-new';
	addNewButton.textContent = '+ Add model';
	modal.appendChild( addNewButton );

	function close() {

		document.removeEventListener( 'keydown', onDocumentKeyDown );
		overlay.remove();

	}

	function onDocumentKeyDown( event ) {

		if ( event.key === 'Escape' ) close();

	}

	overlay.addEventListener( 'mousedown', ( event ) => {

		if ( event.target === overlay ) close();

	} );
	closeButton.addEventListener( 'click', close );
	document.addEventListener( 'keydown', onDocumentKeyDown );

	// let Escape still close the modal, but keep other keystrokes from
	// reaching the editor's global keyboard shortcuts while typing
	searchInput.addEventListener( 'keydown', ( event ) => {

		if ( event.key === 'Escape' ) {

			close();
			return;

		}

		event.stopPropagation();

	} );

	function selectModel( model ) {

		const uuid = THREE.MathUtils.generateUUID();
		addWpModelToScene( model.id, uuid, editor );
		editor.sendMqtt( 'addModel', { modelId: model.id, uuid } );
		close();

	}

	function renderGrid() {

		grid.textContent = '';

		const totalPages = Math.max( 1, Math.ceil( filteredModels.length / PAGE_SIZE ) );
		if ( currentPage > totalPages ) currentPage = totalPages;

		const start = ( currentPage - 1 ) * PAGE_SIZE;
		const pageModels = filteredModels.slice( start, start + PAGE_SIZE );

		emptyMessage.style.display = filteredModels.length === 0 ? 'block' : 'none';
		grid.style.display = filteredModels.length === 0 ? 'none' : 'grid';

		pageModels.forEach( ( model ) => {

			const card = document.createElement( 'button' );
			card.type = 'button';
			card.className = 'wv-model-card';
			card.title = model.title;

			if ( model.thumbnail ) {

				const img = document.createElement( 'img' );
				img.className = 'wv-model-card-thumb';
				img.src = model.thumbnail;
				img.alt = model.title;
				card.appendChild( img );

			} else {

				const placeholder = document.createElement( 'div' );
				placeholder.className = 'wv-model-card-thumb wv-model-card-thumb-placeholder';
				placeholder.textContent = '3D';
				card.appendChild( placeholder );

			}

			const name = document.createElement( 'div' );
			name.className = 'wv-model-card-name';
			name.textContent = model.title;
			card.appendChild( name );

			card.addEventListener( 'click', () => selectModel( model ) );
			grid.appendChild( card );

		} );

		pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
		prevButton.disabled = currentPage <= 1;
		nextButton.disabled = currentPage >= totalPages;

	}

	function applyFilter() {

		const query = searchInput.value.trim();
		filteredModels = allModels.filter( ( model ) => matchesQuery( model, query ) );
		currentPage = 1;
		renderGrid();

	}

	searchInput.addEventListener( 'input', applyFilter );
	prevButton.addEventListener( 'click', () => { currentPage--; renderGrid(); } );
	nextButton.addEventListener( 'click', () => { currentPage++; renderGrid(); } );
	addNewButton.addEventListener( 'click', () => {

		// open in a new tab so the 3D editor stays loaded in this one
		window.open( '/wp-admin/post-new.php?post_type=vr-model', '_blank' );

	} );

	document.body.appendChild( overlay );
	searchInput.focus();
	grid.style.display = 'none';

	fetchModels()
		.then( ( models ) => {

			allModels = models;
			applyFilter();

		} )
		.catch( ( error ) => {

			console.error( 'AddModelModal: failed to load models', error );
			emptyMessage.textContent = 'Failed to load models.';
			emptyMessage.style.display = 'block';
			grid.style.display = 'none';

		} );

}

export { openAddModelModal };
