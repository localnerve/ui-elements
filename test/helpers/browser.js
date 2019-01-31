/**
 * Run in-browser mocha tests.
 *
 * Copyright (c) 2017-2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-disable no-underscore-dangle, func-names */
/* global window, mocha */
(function () {
  function getFriendlyTestResult (testResult) {
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

  function startInBrowserMochaTests () {
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
          const parseableTest = getFriendlyTestResult(test);
          rawTestData.push(parseableTest);
          passedTests.push(parseableTest);
        })
        .on('fail', (test) => {
          const parseableTest = getFriendlyTestResult(test);
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

  window.__testUtils = {
    startInBrowserMochaTests
  };
}());
