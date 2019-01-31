/**
 * Entry for simple-scroll-intersection demo.
 *
 * Moves four elements around on scroll, updates them on dis/intersection.
 *
 * Copyright (c) 2017-2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, requestAnimationFrame */
/* eslint-disable import/no-unresolved */
import { createSimpleScrollIntersection } from './simple-scroll-intersection';

function updateElement (element, result) {
  const direction = Object.keys(result.from).filter(key => result.from[key]);

  element.classList.toggle('intersected');

  if (result.intersection) {
    this.directionClass = `${direction}-x`;
    element.classList.add(this.directionClass);
  } else {
    element.classList.remove(this.directionClass);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  let scrollTick = false;
  const scrollSelector = 'body';
  const targetSelector = '.target';
  const ssiUpdates = [];

  const {
    top, right, bottom, left
  } = ['.top', '.right', '.bottom', '.left'].reduce((prev, curr) => {
    const acc = prev;
    const el = document.querySelector(curr);

    ssiUpdates.push(createSimpleScrollIntersection({
      scrollSelector,
      movingSelector: curr,
      target: targetSelector,
      notify: updateElement.bind({}, el)
    }).getUpdateScroll());

    acc[curr.substring(1)] = el;
    return acc;
  }, {});

  function updateScroll () {
    const y = window.scrollY;

    top.style.transform = `translate3d(-50%, ${y * 1.5}px, 0)`;
    right.style.transform = `translate3d(${-(y * 1.5)}px, -50%, 0)`;
    bottom.style.transform = `translate3d(-50%, ${-y}px, 0)`;
    left.style.transform = `translate3d(${y}px, -50%, 0)`;

    ssiUpdates.forEach(update => update());
  }

  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(() => {
        updateScroll();
        scrollTick = false;
      });
    }
  }, {
    passive: true
  });
});
