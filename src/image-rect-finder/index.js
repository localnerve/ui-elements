/**
 * App entry
 *
 * Copyright (c) 2017-2020 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
/* eslint-disable import/no-unresolved */
import createScene from './phone-scene';
/* eslint-enable import/no-unresolved */

window.addEventListener('DOMContentLoaded', () => {
  createScene({ image: document.querySelector('.image') });
}, {
  once: true
});
