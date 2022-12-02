const path = require("path");
const { merge } = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = env => {
  return merge(base(env), {
    entry: {
      main: "./src/main.js",
      app: "./src/app.js",
      flightlogs: "./src/flightlogs.js",
      processing: "./src/processing.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app")
    }
  });
};
