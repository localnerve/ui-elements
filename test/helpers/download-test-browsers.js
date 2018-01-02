/*
 * Copyright (c) 2017-2018 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable import/no-unresolved, no-console */
const fs = require('fs');
const seleniumAssistant = require('selenium-assistant');
const minVersions = require('./min-versions');

// For now, only do this if it has not previously been done, using the SA install dir
// as the source of truth.
const installDir = seleniumAssistant.getBrowserInstallDir();

console.log('installDir', installDir); // eslint-disable-line

if (!fs.existsSync(installDir)) {
  const promises = [
    seleniumAssistant.downloadLocalBrowser('chrome', 'stable', minVersions.chrome),
    seleniumAssistant.downloadLocalBrowser('chrome', 'beta', minVersions.chrome),
    seleniumAssistant.downloadLocalBrowser('chrome', 'unstable', minVersions.chrome),
    seleniumAssistant.downloadLocalBrowser('firefox', 'stable', minVersions.firefox),
    seleniumAssistant.downloadLocalBrowser('firefox', 'beta', minVersions.firefox),
    seleniumAssistant.downloadLocalBrowser('firefox', 'unstable', minVersions.firefox)
  ];

  Promise.all(promises)
    .then(() => {
      console.log('Browser download complete.');
    })
    .catch((err) => {
      console.log('Failed to download browsers.', err);
    });
}
