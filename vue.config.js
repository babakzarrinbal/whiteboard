var manifestJSON = require("./public/manifest.json");

module.exports = {
  productionSourceMap: false,
  pwa: {
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "./src/serviceworker/service-worker.js",
      importWorkboxFrom: "local"
    },
    manifestPath: "./manifest.json",
    themeColor: manifestJSON.theme_color,
    name: manifestJSON.short_name,
    msTileColor: manifestJSON.background_color,
    iconPaths: {
      favicon32: "img/logos/favicon-32x32.png",
      favicon16: "img/logos/favicon-16x16.png",
      appleTouchIcon: "img/logos/apple-touch-icon-152x152.png",
      maskIcon: "img/logos/safari-pinned-tab.svg",
      msTileImage: "img/logos/msapplication-icon-144x144.png"
    }
  },
  outputDir: "docs",
  publicPath: "/whiteboard/",
   devServer: {
    host: "localhost",
  },
};
