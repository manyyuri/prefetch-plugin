const PrefetchPlugin = require("./prefetch-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./index.js",
  plugins: [new HtmlWebpackPlugin(), new PrefetchPlugin()],
};
