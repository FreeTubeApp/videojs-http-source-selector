import videojs from 'video.js';
const MenuItem = videojs.getComponent('MenuItem');
const Component = videojs.getComponent('Component');

class SourceMenuItem extends MenuItem {
  constructor(player, options) {
    options.selectable = true;
    options.multiSelectable = false;

    super(player, options);
  }

  handleClick() {
    const selected = this.options_;

    super.handleClick();

    const levels = this.player().qualityLevels();

    for (let i = 0; i < levels.length; i++) {
      // If this is the Auto option, enable all renditions for adaptive selection
      levels[i].enabled = selected.index === levels.length || selected.index === i;
    }
  }

  update() {
    const selectedIndex = this.player().qualityLevels().selectedIndex;
    this.selected(this.options_.index === selectedIndex);
  }
}

Component.registerComponent('SourceMenuItem', SourceMenuItem);
export default SourceMenuItem;
