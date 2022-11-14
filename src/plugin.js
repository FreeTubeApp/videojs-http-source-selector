import videojs from 'video.js';
import {version as VERSION} from '../package.json';

import SourceMenuButton from './components/SourceMenuButton';
import SourceMenuItem from './components/SourceMenuItem';

// Default options for the plugin.
const defaults = {};

const registerPlugin = videojs.registerPlugin;
// const dom = videojs.dom || videojs;

/**
* Function to invoke when the player is ready.
*
* This is a great place for your plugin to initialize itself. When this
* function is called, the player will have its DOM and child components
* in place.
*
* @function onPlayerReady
* @param    {Player} player
*           A Video.js player object.
*
* @param    {Object} [options={}]
*           A plain object containing options for the plugin.
*
* @return {boolean}
*         Returns false if not use Html5 tech
*/
const onPlayerReady = (player, options) => {
  player.addClass('vjs-http-source-selector');
  // This plugin only supports level selection for HLS playback
  if (player.techName_ !== 'Html5') {
    return false;
  }

  /**
  *
  * We have to wait for the manifest to load before we can scan renditions for resolutions/bitrates to populate selections
  *
  **/
  player.on(['loadedmetadata'], function(e) {
    videojs.log('loadmetadata event');
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (!player.videojsHTTPSouceSelectorInitialized) {
      player.videojsHTTPSouceSelectorInitialized = true;
      const controlBar = player.controlBar;
      const fullscreenToggle = controlBar.getChild('fullscreenToggle').el();

      controlBar.el().insertBefore(controlBar.addChild('SourceMenuButton').el(), fullscreenToggle);
    }
  });
};

/**
  * A video.js plugin.
  *
  * In the plugin function, the value of `this` is a video.js `Player`
  * instance. You cannot rely on the player being in a "ready" state here,
  * depending on how the plugin is invoked. This may or may not be important
  * to you; if not, remove the wait for "ready"!
  *
  * @function httpSourceSelector
  * @param    {Object} [options={}]
  *           An object of options left to the plugin author to define.
  */
const httpSourceSelector = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
    // this.getChild('controlBar').addChild('SourceMenuButton', {});
  });

  videojs.registerComponent('SourceMenuButton', SourceMenuButton);
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

// Include the version number.
httpSourceSelector.VERSION = VERSION;

export default httpSourceSelector;
