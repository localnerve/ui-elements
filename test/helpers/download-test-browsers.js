/*
 * Copyright (c) 2017-2024 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable no-console */
const fs = require('fs');
const seleniumAssistant = require('selenium-assistant');

// For now, only do this if it has not previously been done, using the SA install dir
// as the source of truth.
const installDir = seleniumAssistant.getBrowserInstallDir();

console.log('installDir', installDir); // eslint-disable-line

if (!fs.existsSync(installDir)) {
  const promises = [
    seleniumAssistant.downloadLocalBrowser('chrome', 'stable', 240),
    // seleniumAssistant.downloadLocalBrowser('chrome', 'beta', 240),
    // seleniumAssistant.downloadLocalBrowser('chrome', 'unstable', 240),
    seleniumAssistant.downloadLocalBrowser('firefox', 'stable', 240),
    seleniumAssistant.downloadLocalBrowser('firefox', 'beta', 240),
    // seleniumAssistant.downloadLocalBrowser('firefox', 'unstable', 240)
  ];

  Promise.all(promises)
    .then(() => {
      console.log('Browser download complete.');
    })
    .catch((err) => {
      console.log('Failed to download browsers.', err);
    });
}
