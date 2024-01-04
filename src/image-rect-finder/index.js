/**
 * App entry
 *
 * Copyright (c) 2017-2024 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
import createScene from './phone-scene';

window.addEventListener('DOMContentLoaded', () => {
  createScene({ image: document.querySelector('.image') });
}, {
  once: true
});
