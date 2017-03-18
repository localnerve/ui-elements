/**
 * Entry for comp3
 */
/* global window, document */
/* eslint-disable import/no-unresolved, import/extensions */
import { initializeParallax } from './parallax';
import { createCustomSticky } from './custom-sticky';

window.addEventListener('DOMContentLoaded', () => {
  initializeParallax(document.querySelector('.main'));
  createCustomSticky({
    scrollSelector: '.main',
    stationarySelector: 'header',
    movingSelector: '.navigation-container',
    traverse: '.logo-container'
  }).start();
}, {
  once: true
});
