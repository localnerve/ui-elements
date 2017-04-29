/**
 * Horizontal-pager next an prev function tests.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, before, describe, it */
/* eslint-disable no-console, prefer-arrow-callback, func-names, no-underscore-dangle */

describe('Animation Tests', function () {
  const targetClass = 'page-item';
  const mainFrameId = '#demo-main';
  const twoFrameId = '#demo-two';

  function verifyResult (doc, expectedPrev, expectedCurr, result) {
    const txComplete = 'translateX(0';
    const pages = doc.querySelectorAll(`.${targetClass}`);
    const currTransform = pages[result.currTargetIndex].style.transform;
    const notCurrent = [...Array(pages.length).keys()];
    notCurrent.splice(result.currTargetIndex, 1);

    currTransform.should.contain(txComplete);

    notCurrent.forEach((pageIndex) => {
      const pageTransform = pages[pageIndex].style.transform;
      pageTransform.should.not.contain(txComplete);
    });

    expectedCurr.should.equal(result.currTargetIndex);
    expectedPrev.should.equal(result.prevTargetIndex);
  }

  function getDemoSubjects (demoId) {
    const demo = document.querySelector(demoId);
    const verify = verifyResult.bind(this, demo.contentDocument);
    const getMethods = {
      [mainFrameId]: window.__testUtils.getHorizontalPagerMain,
      [twoFrameId]: window.__testUtils.getHorizontalPagerTwo
    };

    return getMethods[demoId]()
    .then(horizontalPager => ({
      horizontalPager,
      verify
    }));
  }

  describe('main demo tests', function () {
    let horizontalPager;
    let verify;

    before('main demo tests', function () {
      return getDemoSubjects(mainFrameId).then((subjects) => {
        horizontalPager = subjects.horizontalPager;
        verify = subjects.verify;
      });
    });

    it('should move next from first to second', function () {
      return horizontalPager.next().then(verify.bind(this, 0, 1));
    });

    it('should move next from second to third', function () {
      return horizontalPager.next().then(verify.bind(this, 1, 2));
    });

    it('should move next from third to fourth', function () {
      return horizontalPager.next().then(verify.bind(this, 2, 3));
    });

    it('should move next from fourth to fifth', function () {
      return horizontalPager.next().then(verify.bind(this, 3, 4));
    });

    it('should move next from fifth to sixth', function () {
      return horizontalPager.next().then(verify.bind(this, 4, 5));
    });

    it('should move next from sixth to first', function () {
      return horizontalPager.next().then(verify.bind(this, 5, 0));
    });

    it('should move prev from first to sixth', function () {
      return horizontalPager.prev().then(verify.bind(this, 0, 5));
    });

    it('should move prev from sixth to fifth', function () {
      return horizontalPager.prev().then(verify.bind(this, 5, 4));
    });

    it('should move prev from fifth to fourth', function () {
      return horizontalPager.prev().then(verify.bind(this, 4, 3));
    });

    it('should move prev from fourth to third', function () {
      return horizontalPager.prev().then(verify.bind(this, 3, 2));
    });

    it('should move prev from third to second', function () {
      return horizontalPager.prev().then(verify.bind(this, 2, 1));
    });

    it('should move prev from second to first', function () {
      return horizontalPager.prev().then(verify.bind(this, 1, 0));
    });

    it('should move absolute from first to third', function () {
      return horizontalPager.moveAbs(2).then(verify.bind(this, 0, 2));
    });

    it('should move absolute from third to first', function () {
      return horizontalPager.moveAbs(0).then(verify.bind(this, 2, 0));
    });

    it('should move relative (-) from first to third', function () {
      return horizontalPager.moveRel(-4).then(verify.bind(this, 0, 2));
    });

    it('should move relative (+) from third to first', function () {
      return horizontalPager.moveRel(4).then(verify.bind(this, 2, 0));
    });
  });

  describe('two demo tests', function () {
    let horizontalPager;
    let verify;

    before('two demo tests', function () {
      return getDemoSubjects(twoFrameId).then((subjects) => {
        horizontalPager = subjects.horizontalPager;
        verify = subjects.verify;
      });
    });

    it('should move next from first to second', function () {
      return horizontalPager.next().then(verify.bind(this, 0, 1));
    });

    it('should move next from second to first', function () {
      return horizontalPager.next().then(verify.bind(this, 1, 0));
    });

    it('should move prev from first to second', function () {
      return horizontalPager.prev().then(verify.bind(this, 0, 1));
    });

    it('should move prev from second to first', function () {
      return horizontalPager.prev().then(verify.bind(this, 1, 0));
    });

    it('should move absolute from first to second', function () {
      return horizontalPager.moveAbs(1).then(verify.bind(this, 0, 1));
    });

    it('should move absolute from second to first', function () {
      return horizontalPager.moveAbs(0).then(verify.bind(this, 1, 0));
    });

    it('should move relative (-) from first to second', function () {
      return horizontalPager.moveRel(-1).then(verify.bind(this, 0, 1));
    });

    it('should move relative (+) from second to first', function () {
      return horizontalPager.moveRel(1).then(verify.bind(this, 1, 0));
    });
  });
});
