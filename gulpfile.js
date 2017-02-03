/* eslint-disable import/no-unresolved, no-console */

const fs = require('fs');
const path = require('path');
const q = require('q');
const gulp = require('gulp');
const webpack = require('webpack');

const srcRoot = 'src';
const jsBundle = 'bundle.js';

function getSourceDirs () {
  return q.nfcall(fs.readdir, srcRoot)
    .then(files =>
      files.filter(file => fs.statSync(path.join(srcRoot, file)).isDirectory())
        .map(file => path.join(srcRoot, file))
      );
}

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

function createBundle (env) {
  getSourceDirs()
    .then(getWebpackConfig.bind(null, env))
    .then(webpackConfigs => q.nfcall(webpack, webpackConfigs))
    .then((stats) => {
      if (stats.hasErrors()) {
        throw stats.toJson().errors;
      }
    })
    .catch((e) => {
      console.error(e);
    });
}

gulp.task('copy', () => {
  gulp.src([
    `${srcRoot}/**/index.html`,
    `${srcRoot}/**/${jsBundle}`,
  ])
    .pipe(gulp.dest('dist'));
});

gulp.task('webpack', () => {
  createBundle('production');
});

gulp.task('webpack-dev', () => {
  createBundle('development');
});
