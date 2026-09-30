const cacheName = 'threejs-editor';

self.addEventListener( 'install', function () {

	self.skipWaiting();

} );

self.addEventListener( 'activate', function () {

	self.registration.unregister();

	caches.keys().then( function ( names ) {

		for ( const name of names ) caches.delete( name );

	} );

} );

self.addEventListener( 'fetch', async function ( event ) {

	const request = event.request;

	if ( request.url.startsWith( 'chrome-extension' ) ) return;
  
  if ( request.url.startsWith( 'https://wordverse.designpartyprogram.nl/wp-json/wp/v2/' ) ) return;

	event.respondWith( networkFirst( request ) );

} );

async function networkFirst( request ) {

	try {

		let response = await fetch( request );

		if ( request.url.endsWith( 'editor/' ) || request.url.endsWith( 'editor/index.html' ) ) { // copied from coi-serviceworker

			const newHeaders = new Headers( response.headers );
			newHeaders.set( 'Cross-Origin-Embedder-Policy', 'require-corp' );
			newHeaders.set( 'Cross-Origin-Opener-Policy', 'same-origin' );

			response = new Response( response.body, { status: response.status, statusText: response.statusText, headers: newHeaders } );

		}

		if ( request.method === 'GET' ) {

			const cache = await caches.open( cacheName );
			cache.put( request, response.clone() );

		}

		return response;

	} catch {

		const cachedResponse = await caches.match( request );

		if ( cachedResponse === undefined ) {

			console.warn( '[SW] Not cached:', request.url );

		}

		return cachedResponse;

	}

}
