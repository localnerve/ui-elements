/**
 * webpack config to build the public module.
 * Devdeps in outer repo.
 */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.join(__dirname, 'horizontal-pager.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: "horizontalPager",
    libraryTarget: "umd"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),
    new webpack.BannerPlugin({
      banner: 'horizontal-pager, Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC, BSD-3-Clause',
      entryOnly: true
    })
  ]
};
