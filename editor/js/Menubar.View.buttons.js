import { UIPanel, UIButton } from './libs/ui.js';



function MenubarViewButtons( editor ) {

  const strings = editor.strings;

  const container = new UIPanel();
  container.setClass( 'menu' );
  container.setId( 'menubar-view' );


  const fullscreenIcon = document.createElement( 'img' );
  fullscreenIcon.title = strings.getKey( 'toolbar/fullscreen' );
  fullscreenIcon.src = 'images/controls/fullScreen.svg';


  const fullscreen = new UIButton();
  fullscreen.dom.className = 'Button';
  fullscreen.dom.appendChild( fullscreenIcon );
  fullscreen.onClick( function () {

    if ( document.fullscreenElement === null ) {

      document.documentElement.requestFullscreen();

    } else if ( document.exitFullscreen ) {

      document.exitFullscreen();

    }

    // Safari

    if ( document.webkitFullscreenElement === null ) {

      document.documentElement.webkitRequestFullscreen();

    } else if ( document.webkitExitFullscreen ) {

      document.webkitExitFullscreen();

    }

  } );
  container.add( fullscreen );

  if ( 'xr' in navigator ) {

    navigator.xr.isSessionSupported( 'immersive-vr' )
      .then( function ( supported ) {

        if ( supported ) {


          const strings = editor.strings;
          const xrIcon = document.createElement( 'img' );
          xrIcon.title = strings.getKey( 'toolbar/fullscreen' );
          xrIcon.src = 'images/controls/noun-vr-6384573.svg';
        
        
          const xr = new UIButton();
          xr.dom.className = 'Button';
          xr.dom.appendChild( xrIcon );

          xr.onClick( function () {

            editor.signals.toggleVR.dispatch();

          } );
          container.add( xr );

        }

      } );

  }

  return container;

}

export {  MenubarViewButtons };