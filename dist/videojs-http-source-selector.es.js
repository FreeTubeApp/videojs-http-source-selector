//! videojs-http-source-selector v1.1.7 ~~ https://github.com/FreeTubeApp/videojs-http-source-selector ~~ MIT License

import videojs from 'video.js';

var version = "1.1.7";

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

var MenuItem = videojs.getComponent('MenuItem');
var Component = videojs.getComponent('Component');

/**
 * MenuItem for changing the video source
 *
 * @return {SourceMenuItem} Sorted array of SourceMenuItems
*/
var SourceMenuItem = /*#__PURE__*/function (_MenuItem) {
  _inheritsLoose(SourceMenuItem, _MenuItem);
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
  function SourceMenuItem(player, options) {
    options.selectable = true;
    options.multiSelectable = false;
    return _MenuItem.call(this, player, options) || this;
  }

  /**
   * Function called whenever a SourceMenuItem is clicked
  */
  var _proto = SourceMenuItem.prototype;
  _proto.handleClick = function handleClick() {
    var selected = this.options_;
    _MenuItem.prototype.handleClick.call(this);
    var levels = this.player().qualityLevels();
    for (var i = 0; i < levels.length; i++) {
      // If this is the Auto option, enable all renditions for adaptive selection
      levels[i].enabled = selected.index === levels.length || selected.index === i;
    }
  }

  /**
  * Create SourceMenuItems and sort them
  */;
  _proto.update = function update() {
    var selectedIndex = this.player().qualityLevels().selectedIndex;
    this.selected(this.options_.index === selectedIndex);
  };
  return SourceMenuItem;
}(MenuItem);
Component.registerComponent('SourceMenuItem', SourceMenuItem);

var MenuButton = videojs.getComponent('MenuButton');

/**
 * A button that hides/shows sorted SourceMenuItems
*/
var SourceMenuButton = /*#__PURE__*/function (_MenuButton) {
  _inheritsLoose(SourceMenuButton, _MenuButton);
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
  function SourceMenuButton(player, options) {
    var _this;
    _this = _MenuButton.call(this, player, options) || this;
    MenuButton.apply(_assertThisInitialized(_this), arguments);
    var qualityLevels = _this.player().qualityLevels();

    // Handle options: We accept an options.default value of ( high || low )
    // This determines a bias to set initial resolution selection.
    if (options && options["default"]) {
      if (options["default"] === 'low') {
        for (var i = 0; i < qualityLevels.length; i++) {
          qualityLevels[i].enabled = i === 0;
        }
      } else if (options["default"] === 'high') {
        for (var _i = 0; _i < qualityLevels.length; _i++) {
          qualityLevels[_i].enabled = _i === qualityLevels.length - 1;
        }
      }
    }

    // Bind update to qualityLevels changes
    _this.player().qualityLevels().on(['change', 'addqualitylevel'], videojs.bind(_assertThisInitialized(_this), _this.update));
    return _this;
  }

  /**
   * Create div with videojs classes
   *
   * @return {Element} The sum of the two numbers.
  */
  var _proto = SourceMenuButton.prototype;
  _proto.createEl = function createEl() {
    return videojs.dom.createEl('div', {
      className: 'vjs-http-source-selector vjs-menu-button vjs-menu-button-popup vjs-control vjs-button'
    });
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @return {SourceMenuItem[]} The sum of the two numbers.
  */;
  _proto.buildCSSClass = function buildCSSClass() {
    return MenuButton.prototype.buildCSSClass.call(this) + ' vjs-icon-cog';
  }

  /**
   * Update the menu button
   *
   * @return {any} _
  */;
  _proto.update = function update() {
    return MenuButton.prototype.update.call(this);
  }

  /**
   * Create SourceMenuItems and sort them
   *
   * @return {SourceMenuItem[]} Sorted array of SourceMenuItems
  */;
  _proto.createItems = function createItems() {
    var menuItems = [];
    var levels = this.player().qualityLevels();
    var labels = [];
    for (var index = levels.length - 1; index >= 0; index--) {
      var selected = index === levels.selectedIndex;

      // Display height if height metadata is provided with the stream, else use bitrate
      var label = "" + index;
      var sortVal = index;
      if (levels[index].height) {
        label = levels[index].height + "p";
        sortVal = parseInt(levels[index].height, 10);
      } else if (levels[index].bitrate) {
        label = Math.floor(levels[index].bitrate / 1e3) + " kbps";
        sortVal = parseInt(levels[index].bitrate, 10);
      }

      // Skip duplicate labels
      if (labels.indexOf(label) !== -1) {
        continue;
      }
      labels.push(label);
      menuItems.push(new SourceMenuItem(this.player_, {
        label: label,
        index: index,
        selected: selected,
        sortVal: sortVal
      }));
    }

    // If there are multiple quality levels, offer an 'auto' option
    if (levels.length > 1) {
      menuItems.push(new SourceMenuItem(this.player_, {
        label: 'Auto',
        index: levels.length,
        selected: false,
        sortVal: 99999
      }));
    }

    // Sort menu items by their label name with Auto always first
    menuItems.sort(function (a, b) {
      return b.options_.sortVal - a.options_.sortVal;
    });
    return menuItems;
  };
  return SourceMenuButton;
}(MenuButton);

// Default options for the plugin.
var defaults = {};
var registerPlugin = videojs.registerPlugin;
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
var onPlayerReady = function onPlayerReady(player, options) {
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
  player.on(['loadedmetadata'], function (e) {
    videojs.log('loadmetadata event');
    // hack for plugin idempodency... prevents duplicate menubuttons from being inserted into the player if multiple player.httpSourceSelector() functions called.
    if (!player.videojsHTTPSouceSelectorInitialized) {
      player.videojsHTTPSouceSelectorInitialized = true;
      var controlBar = player.controlBar;
      var fullscreenToggle = controlBar.getChild('fullscreenToggle').el();
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
var httpSourceSelector = function httpSourceSelector(options) {
  var _this = this;
  this.ready(function () {
    onPlayerReady(_this, videojs.mergeOptions(defaults, options));
    // this.getChild('controlBar').addChild('SourceMenuButton', {});
  });

  videojs.registerComponent('SourceMenuButton', SourceMenuButton);
  videojs.registerComponent('SourceMenuItem', SourceMenuItem);
};

// Register the plugin with video.js.
registerPlugin('httpSourceSelector', httpSourceSelector);

// Include the version number.
httpSourceSelector.VERSION = version;

export { httpSourceSelector as default };
