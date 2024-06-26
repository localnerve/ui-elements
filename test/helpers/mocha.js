/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * 4/2017, agrant modified
 */

/**
 * The results from a set of Mocha tests
 *
 * @typedef {Object} MochaTestResults
 * @property {Array<MochaTestResult>} passed   Tests that have passed
 * @property {Array<MochaTestResult>} failed   Tests that have failed
 */

/**
 * @typedef {Object} MochaTestResult
 * @property {String} parentTitle  Title of the parent test suite
 * @property {String} title        Title of the test case
 * @property {String} state        State of the test - 'passed' or 'failed'
 * @property {String} errMessage   This is defined if the test threw an error
 */

/**
 * <p>This class is a helper that will run Mocha tests and offers consistent
 * error reporting.</p>
 *
 * @example <caption>Usage in Browser Window</caption>
 * <script src="/node_modules/sw-testing-helpers/browser/mocha-utils.js">
 * </script>
 * <script>
 * console.log(window.goog.mochaUtils);
 * </script>
 *
 * @example <caption>Usage in Service Worker</caption>
 * importScripts('/node_modules/sw-testing-helpers/browser/mocha-utils.js');
 * console.log(self.goog.mochaUtils);
 *
 * @example <caption>Usage in Node</caption>
 * const mochaUtils = require('sw-testing-helpers').mochaUtils;
 * console.log(mochaUtils);
 */
class MochaUtils {
  /**
   * Start Mocha tests in a browser, checking for leaks and
   * collect passed / failed results, resolving the promise with the results
   * in a friendly format.
   *
   * @return {Promise<MochaTestResults>} The resutls from the Mocha test
   */
  static startInBrowserMochaTests () {
    return new Promise((resolve) => {
      let topLevelTitle = null;
      const rawTestData = [];
      const passedTests = [];
      const failedTests = [];

      mocha.checkLeaks();

      const runResults = mocha.run();

      if (runResults.total === 0) {
        resolve({
          topLevelTitle,
          testResults: {
            raw: rawTestData,
            passed: passedTests,
            failed: failedTests
          }
        });
        return;
      }

      // pass, fail and end events allow up to capture results and
      // determine when to publish test results
      runResults
        .on('pass', (test) => {
          const parseableTest = MochaUtils.getFriendlyTestResult(test);
          rawTestData.push(parseableTest);
          passedTests.push(parseableTest);
        })
        .on('fail', (test) => {
          const parseableTest = MochaUtils.getFriendlyTestResult(test);
          rawTestData.push(parseableTest);
          failedTests.push(parseableTest);
        })
        .on('end', () => {
          resolve({
            topLevelTitle,
            testResults: {
              raw: rawTestData,
              passed: passedTests,
              failed: failedTests
            }
          });
        });

      // No tests so end won't be called
      if (mocha.suite.suites.length === 0) {
        resolve({
          topLevelTitle,
          testResults: {
            raw: rawTestData,
            passed: passedTests,
            failed: failedTests
          }
        });
      } else {
        topLevelTitle = mocha.suite.suites[0].title;
      }
    });
  }

  /**
   * <p>Print the User Agent of the browser, load the page
   * the Mocha tests are in and wait for the results.</p>
   *
   * @param  {String} browserName Name to be printed with the browsers UserAgent
   * @param  {WebDriver} driver   Instance of a {@link http://selenium.googlecode.com/git/docs/api/javascript/class_webdriver_WebDriver.html | WebDriver}
   * @param  {String} url         URL of that has mocha tests.
   * @return {Promise<MochaTestResults>}   Returns the results from the
   * browsers tests
   */
  static startWebDriverMochaTests (browserName, driver, url) {
    return driver.get(url)
      .then(() => {
        // We get webdriver to wait until window.testsuite.testResults is defined.
        // This is set in the in browser mocha tests when the tests have finished
        // successfully
        return driver.wait(function () {
          return driver.executeScript(function () {
            return (typeof window.testsuite !== 'undefined')
              && (typeof window.testsuite.testResults !== 'undefined');
          });
        });
      })
      .then(() => {
        // This simply retrieves the test results from the inbrowser mocha tests
        return driver.executeScript(function () {
          return window.testsuite.testResults;
        });
      });
  }

  /**
   * @private
   * @param {Object} testResult The Mocha test result to be filtered.
   * @return {Object} A friendlier interpretation of the mocha test result.
   */
  static getFriendlyTestResult (testResult) {
    const friendlyResult = {
      parentTitle: testResult.parent.title,
      title: testResult.title,
      state: testResult.state,
    };

    if (testResult.err) {
      friendlyResult.errMessage = testResult.err.message;
      friendlyResult.stack = testResult.err.stack;
    }

    return friendlyResult;
  }

  /**
   * @param {object} testResults Tests to convert to a friendly message
   * @return {String} The results in a pretty string.
   */
  static prettyPrintResults (testResults) {
    let prettyResultsString = '';

    testResults.raw.forEach((testResult) => {
      let testResultString = '';
      switch (testResult.state) {
        case 'passed':
          testResultString += '✔️ [Passed] ';
          break;
        case 'failed':
          testResultString += '❌ [Failed] ';
          break;
        default:
          testResultString += '❓ [Unknown] ';
          break;
      }

      testResultString += `${testResult.parentTitle} > ${testResult.title}\n`;

      if (testResult.state === 'failed') {
        const pad = '    ';
        const indentedStack = testResult.stack.split('\n').join(`\n${pad}`);

        testResultString += `\n${pad}${testResult.errMessage}\n\n`;
        testResultString += `${pad}[Stack Trace]\n`;
        testResultString += `${pad}${indentedStack}\n`;
      }

      prettyResultsString += `${testResultString}\n`;
    });

    return prettyResultsString;
  }
}

if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
  throw new Error(
    'To use MochaUtils in the browser please use the browser/mocha-utils.js file'
  );
}

module.exports = {
  startInBrowserMochaTests: MochaUtils.startInBrowserMochaTests,
  startWebDriverMochaTests: MochaUtils.startWebDriverMochaTests,
  prettyPrintResults: MochaUtils.prettyPrintResults
};
