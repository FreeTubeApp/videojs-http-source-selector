module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['qunit'],
    files: [
      'node_modules/video.js/dist/video-js.css',
      'dist/videojs-http-source-selector.css',

      'node_modules/sinon/pkg/sinon.js',
      'node_modules/video.js/dist/video.js',
      'test/dist/bundle.js'
    ],
    reporters: ['dots'],
    port: 9876,
    colors: true,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  });
};
