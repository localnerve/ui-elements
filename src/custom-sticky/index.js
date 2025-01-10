/**
 * Entry module for custom-sticky example.
 *
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

import { initializeParallax } from './parallax';
import { createCustomSticky, CSDirection } from './custom-sticky';

window.addEventListener('DOMContentLoaded', () => {
  const mainSelector = '.main';
  const mainElement = document.querySelector(mainSelector);
  const navContainer = document.querySelector('.navigation-container');
  const csCtr = document.querySelector('.cs-ctr');
  const csTtb = document.querySelector('.cs-ttb');
  const blockAnimationLength = (
    csCtr.getBoundingClientRect().bottom - csTtb.getBoundingClientRect().bottom
  ) * 1.2;

  initializeParallax(mainElement);

  const csBehaviors = [
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ttb',
      target: '.cs-ctr',
      animationLength: () => blockAnimationLength,
      direction: CSDirection.down,
      transform: y => `translateX(-50%) translateY(${y}px)`
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-ltr',
      target: '.cs-ctr',
      animationLength: () => blockAnimationLength,
      direction: CSDirection.right
    }),
    createCustomSticky({
      scrollSelector: mainSelector,
      movingSelector: '.cs-rtl',
      target: '.cs-ctr',
      animationLength: () => blockAnimationLength,
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
    alwaysVisible: true,
    animationLength: () => navContainer.getBoundingClientRect().top,
    notify: () => {
      document.querySelector('header').classList.toggle('tint');
    },
    direction: CSDirection.up
  }).start(csBehaviors);
}, {
  once: true
});
