/**
 * webpack config to build the public module.
 * Devdeps in outer repo.
 *
 * Copyright (c) 2017-2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'index.js'),
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      type: 'commonjs-static'
    }
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
      banner: 'jump-scroll, Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC, BSD-3-Clause',
      entryOnly: true
    })
  ]
};
