const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ReplacePlugin = require('replace-webpack-plugin');

module.exports = {
  devtool: 'source-map',

  entry: ['bootstrap-loader/extractStyles'],

  output: {
    publicPath: '/',
  },

  module: {
    loaders: [{
      test: /\.scss$/,
      loader: 'style!css!postcss-loader!sass',
    }],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
      },
      __DEVELOPMENT__: false,
    }),
    new ExtractTextPlugin('bundle.css'),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new ReplacePlugin({
      skip: process.env.NODE_ENV === 'development',
      entry: 'index.html',
      hash: '[hash]',
      output: 'dist/index.html',
      data: {
        css: '<link type="text/css" rel="stylesheet" href="./bundle.css?' + Date.now() + '">',
        js: '<script src="./bundle.js?' + Date.now() + '"></script>',
      },
    }),
    new webpack.ProvidePlugin({
      Promise: 'exports?global.Promise!es6-promise',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
    }),
  ],
};
