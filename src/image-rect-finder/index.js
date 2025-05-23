/**
 * App entry
 *
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import createScene from './phone-scene';

window.addEventListener('DOMContentLoaded', () => {
  createScene({ image: document.querySelector('.image') });
}, {
  once: true
});
