/**
 * Start the test globals.
 * 
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
const getLocalServer = require('../src/utils/local-server.js');
const port = 3010;
const dir = './dist';

let server;

function teardown () {
  if (server) {
    server.stop();
  }
}

export default async function setup () {
  server = getLocalServer();
  server.start(dir, port); // returns promise if you want to wait
  return teardown;
}