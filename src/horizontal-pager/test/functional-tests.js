/**
 * Functional tests for horizontal-pager
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

function checkExpectedPage (driver, pageId) {
  return driver.findElement({ id: pageId })
    .then(element => element.isDisplayed())
    .then((expected) => {
      if (!expected) {
        throw new Error(`${pageId} was not displayed as expected`);
      }
    });
}

function swipeLeft (driver) {
  return driver.touchActions()
    .tapAndHold({ x: 250, y: 250 })
    .move({ x: -240, y: 250 })
    .release({ x: 10, y: 250 })
    .perform();
}

function touchTests (driver) {
  console.log('Executing touch tests...'); // eslint-disable-line
  return swipeLeft(driver)
    .then(checkExpectedPage.bind(null, driver, 'page-2'));
}

function startWebDriverFunctionalTests (driver, url) {
  return driver.get(url)
    .then(checkExpectedPage.bind(null, driver, 'page-1'))
    .then(() => driver.getCapabilities())
    .then((capabilities) => {
      const hasTouch = capabilities.get('hasTouchScreen');
      if (hasTouch) {
        return touchTests(driver);
      }
      /*
      TODO: fix setting capabilities
      https://github.com/GoogleChrome/selenium-assistant/issues/90

      capabilities.forEach((value, key) => {
        console.log('@@@ caps', key, value); // eslint-disable-line
      });
      */
      return false;
    })
    .catch((err) => {
      console.error(err); // eslint-disable-line
    });
}

module.exports = {
  startWebDriverFunctionalTests
};
