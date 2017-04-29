/**
 * Get horizontal-pager from iframes.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, window, document */
/* eslint-disable func-names, no-underscore-dangle */
(function () {
  const mainFrameId = '#demo-main';
  const twoFrameId = '#demo-two';

  const horizontalPagers = {};

  window.addEventListener('message', (e) => {
    if (e.data === 'horizontalPager') {
      const mainFrame = document.querySelector(mainFrameId);
      const twoFrame = document.querySelector(twoFrameId);
      const mainHp = mainFrame.contentWindow.horizontalPager;
      const twoHp = twoFrame.contentWindow.horizontalPager;

      if (mainHp) {
        horizontalPagers[mainFrameId] = mainHp;
      }
      if (twoHp) {
        horizontalPagers[twoFrameId] = twoFrame.contentWindow.horizontalPager;
      }
    }
  });

  function getHorizontalPager (frameId) {
    return new Promise((resolve) => {
      const maxPoll = 5;
      let poll = 0;

      const pagerPoll = setInterval(() => {
        if (horizontalPagers[frameId]) {
          resolve(horizontalPagers[frameId]);
        }
        poll++;
        if (poll >= maxPoll) {
          clearInterval(pagerPoll);
          resolve(null);
        }
      }, 500);
    });
  }

  window.__testUtils.getHorizontalPagerMain =
    getHorizontalPager.bind(null, mainFrameId);
  window.__testUtils.getHorizontalPagerTwo =
    getHorizontalPager.bind(null, twoFrameId);
}());
