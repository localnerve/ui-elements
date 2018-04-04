/**
 * Build scripts
 *
 * Copyright (c) 2017-2018 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable import/no-unresolved, no-console */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const q = require('q');
const gulp = require('gulp');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { getSourceDirs, srcRoot } = require('./src/utils/dirs');

const jsBundle = 'bundle.js';

/**
 * Returns an array of webpack config objects that assume these constraints:
 * 1. Produces one .js only bundle named `jsBundle`.
 * 2. Entry point is index.js
 *
 * @param {String} env - The target env, 'production' for production.
 * @param {Array} dirs - toplevel directories under srcRoot.
 * @returns {Array} Webpack config objects.
 */
function getWebpackConfig (env, dirs) {
  const prod = env === 'production';
  const definitions = {
    DEBUG: !prod,
    'process.env': {
      NODE_ENV: JSON.stringify(env)
    }
  };
  const plugins = [
    new webpack.DefinePlugin(definitions)
  ];
  const optimization = {};

  if (prod) {
    optimization.minimizer = [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false
          },
          output: {
            comments: false
          }
        }
      })
    ];
  }

  return dirs.map(dir => ({
    mode: prod ? 'production' : 'development',
    entry: `${path.join(dir, 'index.js')}`,
    output: {
      path: path.resolve(dir),
      filename: `${jsBundle}`
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /^\/node_modules/,
        loader: 'babel-loader'
      }]
    },
    plugins,
    optimization
  }));
}

/**
 * Creates js bundles for all top level directories under `srcRoot`.
 *
 * @param {String} env - "production" for production.
 * @returns {Promise} Resolves to undefined on completion.
 */
function createBundle (env) {
  return getSourceDirs()
    .then(getWebpackConfig.bind(null, env))
    .then(webpackConfigs => q.nfcall(webpack, webpackConfigs))
    .then((stats) => {
      if (stats.hasErrors()) {
        throw stats.toJson().errors;
      }
    });
}

/**
 * Run `npm install` for any src directory that needs it.
 *
 * @returns {Promise} That resolves if all npm installs succeed, rejects otherwise.
 */
function runPackageInstalls () {
  return getSourceDirs()
    .then((dirs) => {
      const pkgDirs =
        dirs.filter(dir => fs.existsSync(path.join(dir, 'package.json')));

      return Promise.all(pkgDirs.map((pkgDir) => {
        const cp = spawn('npm', ['install'], {
          cwd: pkgDir
        });
        return new Promise((resolve, reject) => {
          cp.on('close', (code) => {
            if (code !== 0) {
              return reject();
            }
            return resolve();
          });
          cp.on('error', reject);
        });
      }));
    });
}

// Define the build tasks:

gulp.task(
  'copy', () =>
    gulp.src([
      `${srcRoot}/**/*.html`,
      `${srcRoot}/**/*.css`,
      `${srcRoot}/**/*.jpg`,
      `${srcRoot}/**/${jsBundle}`,
      `${srcRoot}/**/*worker.js`,
      `${srcRoot}/**/node_modules/**`,
      `!${srcRoot}/horizontal-pager/node_modules`,
      `!${srcRoot}/horizontal-pager/node_modules/**`,
      `!${srcRoot}/**/test`,
      `!${srcRoot}/**/test/**`,
    ])
      .pipe(gulp.dest('dist'))
);

gulp.task('webpack', () => createBundle('production'));
gulp.task('webpack-dev', () => createBundle('development'));
gulp.task('installs', runPackageInstalls);
