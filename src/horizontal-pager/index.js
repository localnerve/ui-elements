/**
 * Entry point to horizontal-pager example.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
/* eslint-disable import/no-unresolved */
import createHorizontalPager from './horizontal-pager';

/**
 * HorizontalPager callback to update the page indicator bubbles.
 *
 * @param {Number} direction - +1 for forward (left), -1 for back (right)
 */
function updateBubble (direction) {
  const selectedBbl = document.querySelector('.bbl.selected');
  const nextSibling = direction > 0 ?
    selectedBbl.nextElementSibling : selectedBbl.previousElementSibling;

  selectedBbl.classList.remove('selected');
  nextSibling.classList.add('selected');
}

let horizontalPager;

document.addEventListener('DOMContentLoaded', () => {
  horizontalPager = createHorizontalPager({
    targetClass: 'page-item',
    willComplete: updateBubble
  });
}, {
  once: true
});

document.addEventListener('unload', () => horizontalPager && horizontalPager.destroy(), {
  once: true
});
