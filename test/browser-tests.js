/*
 * Start mocha browser-tests.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, describe, before, after, it, require */
/* eslint-disable import/no-unresolved, no-console, prefer-arrow-callback, func-names */

const path = require('path');
const fs = require('fs');
const util = require('util');
const seleniumAssistant = require('selenium-assistant');
const minVersions = require('./helpers/min-versions');
const createLocalServer = require('../src/utils/local-server');
const { getSourceDirsSync } = require('../src/utils/dirs');
const { startWebDriverMochaTests } = require('./helpers/mocha');

// Serve assets from project root.
const serverPath = path.join(__dirname, '..');

// Load actual drivers used here.
require('geckodriver');
require('chromedriver');
// Browser specific directions by browser Id.
const browserDirections = {
  chrome: {
    capabilityOptionName: 'chromeOptions',
    capabilities: {
      mobileEmulation: {
        deviceName: 'iPhone 6'
      }
    },
    minVersion: minVersions.chrome,
    testUnstable: false
  },
  firefox: {
    capabilityOptionName: 'firefoxOptions',
    capabilities: null,
    minVersion: minVersions.firefox,
    testUnstable: true
  }
};

// Init chai in this process.
require('chai').should();

// Sub paths to project tests by convention
const pathDemo = 'index.html';
const pathFuncTest = 'test/functional-tests.js';
const pathBrowserTest = 'test/browser-tests/';

describe('Perform Browser Tests', function () {
  this.timeout(4 * 60 * 1000);
  this.retries(3);

  let globalDriverReference = null;
  let testServer = null;
  let testServerURL;

  /**
   * Setup for browser specific tests, assign the globalDriverReference.
   *
   * TODO: fix setting capabilities for functional tests
   * https://github.com/GoogleChrome/selenium-assistant/issues/90
   *
   * @param {Object} browserInfo - browserInfo object from selenium-assistant.
   * @returns {Promise} force tests to wait until globalDriverReference is assigned.
   */
  const beforeBrowser = function (browserInfo) {
    const browserId = browserInfo.getId();
    before(`before ${browserId}`, function () {
      const capabilities = browserDirections[browserId].capabilities;
      if (capabilities) {
        Object.keys(capabilities).forEach((key) => {
          browserInfo.addCapability(
            browserDirections[browserId].capabilityOptionName, capabilities[key]);
        });
      }

      return browserInfo.getSeleniumDriver()
        .then((driver) => {
          globalDriverReference = driver;
        });
    });
  };

  /**
   * Cleanup for browser specific tests, kill driver and clear globalDriverReference.
   * @returns {Promise} wait until web driver is down, and globalDriverReference cleared.
   */
  const afterBrowser = after.bind(this, function () {
    this.timeout(10000);

    if (!globalDriverReference) {
      return Promise.resolve();
    }

    return seleniumAssistant.killWebDriver(globalDriverReference)
      .then(() => {
        globalDriverReference = null;
      });
  });

  /**
   * Queue up a functional test for a browser/project.
   * @param {Object} browserInfo - Browser info from selenium-assistant.
   * @param {Function} browserInfo.getPrettyName - Get human readable browser name.
   * @param {Object} testInfo - Container for functional test info.
   * @param {String} testInfo.projectDir - path to project directory.
   * @param {String} testInfo.testPath - path to functional test module for a project.
   * @param {String} testInfo.demoPath - url.path to the project demo.
   */
  const queueFunctionalTest = (browserInfo, testInfo) => {
    it(`should pass functional tests for ${browserInfo.getPrettyName()} in ${testInfo.projectDir}`,
      function () {
        /* eslint-disable global-require, import/no-dynamic-require */
        const tests = require(testInfo.testPath);
        /* eslint-enable global-require, import/no-dynamic-require */
        return tests.startWebDriverFunctionalTests(
          globalDriverReference, testServerURL + testInfo.demoPath
        );
      });
  };

  /**
   * Queue up a unit test for a browser/project.
   * @param {Object} browserInfo - Browser info from selenium-assistant.
   * @param {Function} browserInfo.getPrettyName - Get human readable browser name.
   * @param {Object} testInfo - Container for functional test info.
   */
  const queueUnitTest = (browserInfo, testInfo) => {
    it(`should pass unit tests for ${browserInfo.getPrettyName()} in ${testInfo.projectDir}`,
      function () {
        return startWebDriverMochaTests(
          browserInfo.getPrettyName(),
          globalDriverReference,
          testServerURL + testInfo.testPath
        )
          .then((testResults) => {
            if (testResults.failed.length > 0) {
              throw new Error(`${util.inspect(testResults.failed, { depth: null })}`);
            }
          });
      });
  };

  /**
   * Start instance of local test server.
   */
  before('Before Browser Tests', function () {
    testServer = createLocalServer();
    return testServer.start(serverPath)
      .then((portNumber) => {
        testServerURL = `http://localhost:${portNumber}`;
      });
  });

  /**
   * Stop instance of local test server.
   */
  after('After Browser Tests', function () {
    testServer.stop();
  });

  seleniumAssistant.printAvailableBrowserInfo();

  // Get local browsers to drive tests.
  const automatedBrowsers = seleniumAssistant.getLocalBrowsers();

  // Get project directories.
  const sourceDirs = getSourceDirsSync();

  // If a project has functional tests by convention, get info to drive tests.
  const functionalTests = sourceDirs
    .filter(dir => fs.existsSync(path.join(dir, pathFuncTest)))
    .map(dir => ({
      projectDir: dir.replace(serverPath, ''),
      testPath: path.join(dir, pathFuncTest),
      demoPath: path.join(
        dir.replace('src', 'dist').replace(serverPath, ''), pathDemo
      )
    }));

  // If a project has unit tests by convention, get info to drive tests.
  const unitTests = sourceDirs
    .filter(dir => fs.existsSync(path.join(dir, pathBrowserTest)))
    .map(dir => ({
      projectDir: dir.replace(serverPath, ''),
      testPath: path.join(dir.replace(serverPath, ''), pathBrowserTest),
    }));

  // Drive the functional and unit tests per browser.
  automatedBrowsers.forEach((browserInfo) => {
    describe(`${browserInfo.getPrettyName()} tests`, () => {
      let browserOK = false;
      const browserId = browserInfo.getId();
      const browserDirection = browserDirections[browserId];

      if (browserDirection) {
        const isUnstable = browserInfo.getReleaseName() === 'unstable';
        let skip = false;

        if (isUnstable) {
          skip = !browserDirection.testUnstable;
        }

        browserOK =
          browserInfo.getVersionNumber() >= browserDirection.minVersion &&
          (functionalTests.length > 0 || unitTests.length > 0) &&
          !skip;
      }

      if (browserOK) {
        beforeBrowser(browserInfo);
        afterBrowser();

        functionalTests.forEach((testInfo) => {
          queueFunctionalTest(browserInfo, testInfo);
        });

        unitTests.forEach((testInfo) => {
          queueUnitTest(browserInfo, testInfo);
        });
      } else {
        console.warn(
          `Skipping ${browserInfo.getPrettyName()}, version ${browserInfo.getVersionNumber()}`
        );
      }
    });
  });
});
