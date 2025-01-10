/**
 * Entry point to scroll-collapse example.
 *
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
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
          console.log('@@@ collapse starting');
          break;
        case SCConstants.END_COLLAPSE:
          console.log('@@@ collapse ended');
          break;
        case SCConstants.START_EXPAND:
          console.log('@@@ expand starting');
          break;
        case SCConstants.END_EXPAND:
          console.log('@@@ expand ended');
          break;
        default:
          console.log('@@@ unknown event');
          break;
      }
    }
  });
}, {
  once: true
});
