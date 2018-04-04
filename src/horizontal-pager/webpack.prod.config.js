/**
 * webpack config to build the public module.
 * Devdeps in outer repo.
 *
 * Copyright (c) 2017-2018 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'horizontal-pager.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'horizontalPager',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
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
    new webpack.BannerPlugin({
      banner: 'horizontal-pager, Copyright (c) 2018 Alex Grant (@localnerve), LocalNerve LLC, BSD-3-Clause',
      entryOnly: true
    })
  ]
};
