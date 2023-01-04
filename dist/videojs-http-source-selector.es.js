//! videojs-http-source-selector v1.1.7 ~~ https://github.com/FreeTubeApp/videojs-http-source-selector ~~ MIT License

import videojs from 'video.js';

var version = "1.1.7";

const MenuItem = videojs.getComponent('MenuItem');
const Component = videojs.getComponent('Component');

/**
 * MenuItem for changing the video source
 *
 * @return {SourceMenuItem} Sorted array of SourceMenuItems
*/
class SourceMenuItem extends MenuItem {
  /**
   * Create SourceMenuItems and sort them
   *
   * @param {videojs.Player} player
   * A videojs player
   *
   * @param {{label, index, selected, sortVal, selectable: true, multiSelectable: false}} options
   * Multiselectable
   *
  */
  constructor(player, options) {
    options.selectable = true;
    options.multiSelectable = false;
    super(player, options);
  }

  /**
   * Function called whenever a SourceMenuItem is clicked
  */
  handleClick() {
    const selected = this.options_;
    super.handleClick();
    const levels = Array.from(this.player().qualityLevels());
    levels.forEach((level, index) => {
      level.enabled = selected.index === levels.length || selected.index === index;
    });
  }

  /**
  * Create SourceMenuItems and sort them
  */
  update() {
    const selectedIndex = this.player().qualityLevels().selectedIndex;
    this.selected(this.options_.index === selectedIndex);
  }
}
Component.registerComponent('SourceMenuItem', SourceMenuItem);

const MenuButton = videojs.getComponent('MenuButton');

/**
 * A button that hides/shows sorted SourceMenuItems
*/
class SourceMenuButton extends MenuButton {
  /**
   * Create SourceMenuItems and sort them
   *
   * @param {videojs.Player} player
   * videojs player
   *
   * @param {{default}} options
   * high | low
   *
  */
  constructor(player, options) {
    super(player, options);
    Reflect.apply(MenuButton, this, arguments);
    const qualityLevels = this.player().qualityLevels();

    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options.default) {
      if (options.default === 'low') {
        for (let index = 0; i < qualityLevels.length; index++) {
          qualityLevels[index].enabled = index === 0;
        }
      } else if (options.default === 'high') {
        for (let index = 0; index < qualityLevels.length; index++) {
          qualityLevels[index].enabled = index === qualityLevels.length - 1;
        }
      }
    }

    // Bind update to qualityLevels changes
    this.player().qualityLevels().on(['change', 'addqualitylevel'], videojs.bind(this, this.update));
  }

  /**
   * Create div with videojs classes
   *
   * @return {Element} The sum of the two numbers.
  */
  createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @return {SourceMenuItem[]} The sum of the two numbers.
  */
  buildCSSClass() {
    return MenuButton.prototype.buildCSSClass.call(this);
  }

  /**
   * Update the menu button
   *
   * @return {any} _
  */
  update() {
    return MenuButton.prototype.update.call(this);
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @return {SourceMenuItem[]} Sorted array of SourceMenuItems
  */
  createItems() {
    const menuItems = [];
    const levels = this.player().qualityLevels();
    const labels = [];
    for (let index = levels.length - 1; index >= 0; index--) {
      const selected = index === levels.selectedIndex;

      // Display height if height metadata is provided with the stream, else use bitrate
      let label = `${index}`;
      let sortValue = index;
      const level = levels[index];
      if (level.height) {
        label = `${level.height}p`;
        sortValue = Number.parseInt(level.height, 10);
      } else if (level.bitrate) {
        label = `${Math.floor(level.bitrate / 1e3)} kbps`;
        sortValue = Number.parseInt(level.bitrate, 10);
      }

      // Skip duplicate labels
      if (labels.includes(label)) {
        continue;
      }
      labels.push(label);
      menuItems.push(new SourceMenuItem(this.player_, {
        label,
        index,
        selected,
        sortValue
      }));
    }

    // If there are multiple quality levels, offer an 'auto' option
    if (levels.length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, {
        label: 'Auto',
        index: levels.length,
        selected: false,
        sortValue: 99_999
      }));
    }

    // Sort menu items by their label name with Auto always first
    menuItems.sort(function (a, b) {
      return b.options_.sortValue - a.options_.sortValue;
    });
    return menuItems;
  }
}

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
  player.on(['loadedmetadata'], function (event) {
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (!player.videojsHTTPSouceSelectorInitialized) {
      player.videojsHTTPSouceSelectorInitialized = true;
      const controlBar = player.controlBar;
      const fullscreenToggle = controlBar.getChild('fullscreenToggle');
      if (fullscreenToggle) {
        controlBar.el().insertBefore(controlBar.addChild('SourceMenuButton').el(), fullscreenToggle.el());
      } else {
        controlBar.el().append(controlBar.addChild('SourceMenuButton').el());
      }
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
const httpSourceSelector = function (options) {
  this.ready(() => {
    const merge = videojs?.obj?.merge || videojs.mergeOptions;
    onPlayerReady(this, merge(defaults, options));
  });
  videojs.registerComponent('SourceMenuButton', SourceMenuButton);
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

// Include the version number.
httpSourceSelector.VERSION = version;

export { httpSourceSelector as default };
