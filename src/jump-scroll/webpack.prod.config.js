/**
 * webpack config to build the public module.
 * Devdeps in outer repo.
 *
 * Copyright (c) 2017-2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import * as path from 'node:path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { stageDir, distDir } from './build-settings.js';

export default {
  mode: 'production',
  entry: path.join(stageDir, 'jump-scroll.js'),
  optimization: {
    minimizer: [new TerserPlugin({ extractComments: false })],
  },
  experiments: {
    outputModule: true
  },
  output: {
    path: distDir,
    filename: 'jump-scroll.js',
    library: {
      type: 'module'
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