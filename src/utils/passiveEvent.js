/**
 * Passive event handler option, cross-browser.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window */

/**
 * @returns {Object|Boolean} A support-sensitive passive event handler option.
 */
export function createPassiveEventHandlerOption () {
  let passiveSupported = false;

  try {
    const testOpts = {
      get passive () {
        passiveSupported = true;
      }
    };
    window.addEventListener('test', null, testOpts);
  } catch (err) {} // eslint-disable-line

  return passiveSupported ? {
    passive: true
  } : false;
}

export default createPassiveEventHandlerOption;
