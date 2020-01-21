/**
 * Simple static local server for demo
 *
 * Copyright (c) 2017-2020 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global */
/* eslint-disable import/no-unresolved, no-underscore-dangle */
const express = require('express');

class LocalServer {
  constructor () {
    this._app = express();
    this._server = null;
  }

  start (path, port) {
    let portNumber = port;

    if (this._server) {
      this._server.close();
    }

    if (typeof portNumber === 'undefined') {
      portNumber = 0; // pick random port number
    }

    this._app.use('/', express.static(path));

    return new Promise((resolve, reject) => {
      this._server = this._app.listen(portNumber, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(this._server.address().port);
      });
    });
  }

  stop () {
    if (this._server) {
      this._server.close();
      this._server = null;
    }
  }
}

module.exports = function createLocalServer () {
  return new LocalServer();
};
