/**
 * Entry for comp3
 */
/* global window, document */
/* eslint-disable import/no-unresolved, import/extensions */
import { initializeParallax } from './parallax';
import { createCustomSticky, CSDirection } from './custom-sticky';

window.addEventListener('DOMContentLoaded', () => {
  const mainSelector = '.main';

  initializeParallax(document.querySelector(mainSelector));

  const csBehaviors = [
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ttb',
      stationary: '.cs-ctr',
      direction: CSDirection.down,
      transform: y => `translateX(-50%) translateY(${y}px)`
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ltr',
      stationary: '.cs-ctr',
      direction: CSDirection.right
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-rtl',
      stationary: '.cs-ctr',
      direction: CSDirection.left
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-end',
      stationary: () => {
        const cRect = document.querySelector('.main').getBoundingClientRect();
        const leftEdgeRect = {
          left: cRect.left,
          right: cRect.left,
          top: cRect.top,
          bottom: cRect.bottom,
          width: 0,
          height: cRect.height
        };
        return leftEdgeRect;
      },
      transform: (x) => {
        const value = x <= 16 ? '-50%' : `${-x}px`;
        return `translateX(${value})`;
      },
      direction: CSDirection.left
    })
  ];

  createCustomSticky({
    scrollSelector: mainSelector,
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
  }).start(csBehaviors);
}, {
  once: true
});
