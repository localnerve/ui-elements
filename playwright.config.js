const path = require('node:path');
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'test',
  timeout: 5000,
  globalSetup: path.resolve('./test/globals.js'),
  projects: [{
    name: 'horizontal-pager',
    testMatch: 'horizontal-pager/**/*.test.js'
  }, {
    name: 'jump-scroll',
    testMatch: 'jump-scroll/**/*.test.js'
  }]
});