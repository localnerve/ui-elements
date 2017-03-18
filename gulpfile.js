/* eslint-disable import/no-unresolved, no-console */

const fs = require('fs');
const path = require('path');
const q = require('q');
const gulp = require('gulp');
const webpack = require('webpack');

const srcRoot = 'src';
const ignoreDirs = [
  'utils'
];
const jsBundle = 'bundle.js';

/**
 * Searches `srcRoot` for top level directories, ignore `utils` directories.
 *
 * @returns {Promise} Resolves to an array of toplevel directories under srcRoot.
 */
function getSourceDirs () {
  return q.nfcall(fs.readdir, srcRoot)
    .then(files =>
      files.filter((file) => {
        const isDir = fs.statSync(path.join(srcRoot, file)).isDirectory();
        return isDir ? ignoreDirs.indexOf(file) === -1 : false;
      })
        .map(file => path.join(srcRoot, file))
      );
}

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

  if (prod) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }));
  }

  return dirs.map(dir => ({
    entry: `./${path.join(dir, 'index.js')}`,
    output: {
      path: path.resolve(dir),
      filename: `${jsBundle}`
    },
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /^\/node_modules/,
        loader: 'babel-loader'
      }]
    },
    plugins
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

// Define the build tasks:

gulp.task('copy', () =>
  gulp.src([
    `${srcRoot}/**/*.html`,
    `${srcRoot}/**/*.css`,
    `${srcRoot}/**/*.jpg`,
    `${srcRoot}/**/${jsBundle}`
  ])
    .pipe(gulp.dest('dist'))
);
gulp.task('webpack', () => createBundle('production'));
gulp.task('webpack-dev', () => createBundle('development'));
