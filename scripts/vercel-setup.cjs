const { copyFileSync, existsSync, mkdirSync } = require('node:fs');

/**
 * Copy built files to public folder.
 */
function copy() {
  const publicFolder = `${__dirname}/../public`;
  const modulesFolder = `${__dirname}/../node_modules`;

  if (!existsSync(`${publicFolder}/dist`)) {
    mkdirSync(`${publicFolder}/dist`, { recursive: true });
  }
  const nodeModules = ['videojs-contrib-quality-levels', 'video.js'];

  for (const nm of nodeModules) {
    if (!existsSync(`${publicFolder}/node_modules/${nm}/dist`)) {
      mkdirSync(`${publicFolder}/node_modules/${nm}/dist`, { recursive: true });
    }
  }
  copyFileSync(`${__dirname}/../index.html`, `${publicFolder}/index.html`);
  copyFileSync(`${modulesFolder}/video.js/dist/video.min.js`, `${publicFolder}/node_modules/video.js/dist/video.min.js`);
  copyFileSync(`${modulesFolder}/video.js/dist/video-js.min.css`, `${publicFolder}/node_modules/video.js/dist/video-js.min.css`);
  copyFileSync(`${modulesFolder}/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js`, `${publicFolder}/node_modules/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js`);
  copyFileSync(`${__dirname}/../dist/videojs-http-source-selector.min.js`, `${publicFolder}/dist/videojs-http-source-selector.min.js`);
  copyFileSync(`${__dirname}/../dist/videojs-http-source-selector.min.css`, `${publicFolder}/dist/videojs-http-source-selector.min.css`);

}

copy();
