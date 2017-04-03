/**
 * Entry module for custom-sticky example.
 */
/* global window, document */
/* eslint-disable import/no-unresolved, import/extensions */
import { initializeParallax } from './parallax';
import { createCustomSticky, CSDirection } from './custom-sticky';

window.addEventListener('DOMContentLoaded', () => {
  const mainSelector = '.main';
  const mainElement = document.querySelector(mainSelector);
  const navContainer = document.querySelector('.navigation-container');

  initializeParallax(mainElement);

  const csBehaviors = [
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ttb',
      target: '.cs-ctr',
      direction: CSDirection.down,
      transform: y => `translateX(-50%) translateY(${y}px)`
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ltr',
      target: '.cs-ctr',
      direction: CSDirection.right
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-rtl',
      target: '.cs-ctr',
      direction: CSDirection.left
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-end',
      target: () => {
        const cRect = mainElement.getBoundingClientRect();
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
    target: 'header',
    animationLength: () => navContainer.getBoundingClientRect().top,
    notify: () => {
      document.querySelector('header').classList.toggle('tint');
    },
    direction: CSDirection.up
  }).start(csBehaviors);
}, {
  once: true
});
