/**
 * Entry for comp3
 */
/* global window, document */
/* eslint-disable import/no-unresolved, import/extensions */
import { initializeParallax } from './parallax';
import { createCustomSticky, CSDirection } from './custom-sticky';

window.addEventListener('DOMContentLoaded', () => {
  initializeParallax(document.querySelector('.main'));

  createCustomSticky({
    scrollSelector: '.main',
    movingSelector: '.navigation-container',
    stationary: 'header',
    traverseLength: () => {
      const logoHeight =
        document.querySelector('.logo-container').getBoundingClientRect().height;
      const navHeight =
        document.querySelector('.navigation-container').getBoundingClientRect().height;
      return Math.ceil((logoHeight - navHeight) + 1);
    },
    direction: CSDirection.up
  }).start();

  createCustomSticky({
    scrollSelector: '.main',
    movingSelector: '.cs-ttb',
    stationary: '.cs-ctr',
    direction: CSDirection.down,
    transform: y => `translateX(-50%) translateY(${y}px)`
  }).start();

  createCustomSticky({
    scrollSelector: '.main',
    movingSelector: '.cs-ltr',
    stationary: '.cs-ctr',
    direction: CSDirection.right
  }).start();

  createCustomSticky({
    scrollSelector: '.main',
    movingSelector: '.cs-rtl',
    stationary: '.cs-ctr',
    direction: CSDirection.left
  }).start();
}, {
  once: true
});
