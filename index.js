/**
 * Simple static server for demo
 *
 * Copyright (c) 2017-2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable no-console */

const path = require('path');
const createLocalServer = require('./src/utils/local-server');

const port = 3010;
const localServer = createLocalServer();

localServer.start(path.join(__dirname, '.'), port)
  .then(portNumber => console.log(`listening on port ${portNumber}`))
  .catch(err => console.error(err));
