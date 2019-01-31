/**
 * Get horizontal-pager from iframes.
 *
 * Copyright (c) 2017-2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, window, document */
/* eslint-disable func-names, no-underscore-dangle */
(function () {
  const mainFrameId = '#demo-main';
  const twoFrameId = '#demo-two';

  const horizontalPagers = {};

  let mainFrame;
  let twoFrame;

  document.addEventListener('DOMContentLoaded', () => {
    mainFrame = document.querySelector(mainFrameId);
    twoFrame = document.querySelector(twoFrameId);
  });

  function pollHorizontalPagers () {
    const mainHp = mainFrame.contentWindow.horizontalPager;
    const twoHp = twoFrame.contentWindow.horizontalPager;

    if (mainHp && !horizontalPagers[mainFrameId]) {
      horizontalPagers[mainFrameId] = mainHp;
    }
    if (twoHp && !horizontalPagers[twoFrameId]) {
      horizontalPagers[twoFrameId] = twoHp;
    }
  }

  function getHorizontalPager (frameId) {
    return new Promise((resolve) => {
      const maxPoll = 5;
      let poll = 0;

      const pagerPoll = setInterval(() => {
        pollHorizontalPagers();
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

  window.__testUtils.getHorizontalPagerMain = getHorizontalPager.bind(null, mainFrameId);
  window.__testUtils.getHorizontalPagerTwo = getHorizontalPager.bind(null, twoFrameId);
}());
