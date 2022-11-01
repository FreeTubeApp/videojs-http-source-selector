const { copyFileSync, existsSync, mkdirSync, watchFile } = require('fs');

function copy() {
  if (!existsSync(`${__dirname}/../dist/`)) {
    mkdirSync(`${__dirname}/../dist/`, { recursive: true });
  }
  copyFileSync(`${__dirname}/../src/plugin.css`, `${__dirname}/../dist/videojs-http-source-selector.css`);
}

copy();

if (process.argv[1] === '--watch') {
  watchFile(`${__dirname}/../src/plugin.css`, { persistent: true }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      copy();
    }
  });
}
