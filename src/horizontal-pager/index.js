/**
 * Entry point to horizontal-pager example.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */
/* eslint-disable import/no-unresolved */
import createHorizontalPager from './horizontal-pager';

/**
 * HorizontalPager callback to update the page indicator bubbles.
 *
 * @param {Object} A moveResult object.
 */
function updateBubble (moveResult) {
  const { distance } = moveResult;
  const selectedBbl = document.querySelector('.bbl.selected');
  const firstBbl = document.querySelector('.bbl:first-child');
  const lastBbl = document.querySelector('.bbl:last-child');
  let sibling = selectedBbl;
  let dist = distance;

  while (distance > 0 ? dist-- : dist++) {
    sibling = distance > 0 ?
      sibling.nextElementSibling || firstBbl :
      sibling.previousElementSibling || lastBbl;
  }

  selectedBbl.classList.remove('selected');
  sibling.classList.add('selected');
}

document.addEventListener('DOMContentLoaded', () => {
  const horizontalPager = createHorizontalPager({
    targetClass: 'page-item',
    willComplete: updateBubble,
    continuous: true
  });
  // Create a global to expose the API.
  window.horizontalPager = horizontalPager;
}, {
  once: true
});

document.addEventListener('unload', () =>
  window.horizontalPager &&
  window.horizontalPager.destroy(), { once: true });
