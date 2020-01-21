/**
 * Entry point to scroll-collapse example.
 *
 * Copyright (c) 2017-2020 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document */
/* eslint-disable import/no-unresolved */
import { startScrollCollapse, SCConstants } from './scroll-collapse';

document.addEventListener('DOMContentLoaded', () => {
  startScrollCollapse({
    topCollapseSelector: '.logo',
    bottomCollapseSelector: '.collapsible-footer',
    scrollSelector: '.text-container',
    props: ['opacity', 'height', 'marginTop', 'marginBottom'],
    notify: (event) => {
      switch (event) {
        case SCConstants.START_COLLAPSE:
          console.log('@@@ collapse starting'); // eslint-disable-line
          break;
        case SCConstants.END_COLLAPSE:
          console.log('@@@ collapse ended'); // eslint-disable-line
          break;
        case SCConstants.START_EXPAND:
          console.log('@@@ expand starting'); // eslint-disable-line
          break;
        case SCConstants.END_EXPAND:
          console.log('@@@ expand ended'); // eslint-disable-line
          break;
        default:
          console.log('@@@ unknown event'); // eslint-disable-line
          break;
      }
    }
  });
}, {
  once: true
});
