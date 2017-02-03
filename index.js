/**
 * Simple static server for demo
 */
/* global console, require */
/* eslint-disable no-console, import/no-unresolved */

const express = require('express');

const server = express();
const rootDir = '.';
const port = 3010;

server.use(express.static(rootDir));
server.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`listening on port ${port}`);
});
