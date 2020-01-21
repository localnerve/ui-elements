/**
 * Horizontal-pager in-browser unit tests.
 *
 * Copyright (c) 2017-2020 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, before, describe, it */
/* eslint-disable no-console, prefer-arrow-callback, func-names, no-underscore-dangle */

describe('Animation Tests', function () {
  const targetClass = 'page-item';
  const mainFrameId = '#demo-main';
  const twoFrameId = '#demo-two';
  const txComplete = 'translateX(0';

  /**
   * Make sure the moveResult has required properties.
   *
   * @param {Object} result - A moveResult object as documented/expected.
   */
  function verifyMoveResult (result) {
    if (!result) {
      throw new Error('moveResult was unexpectedly null');
    }
    if (!('currTargetIndex' in result)) {
      throw new Error('moveResult missing currTargetIndex property');
    }
    if (!('prevTargetIndex' in result)) {
      throw new Error('moveResult missing prevTargetIndex property');
    }
    if (!('distance' in result)) {
      throw new Error('moveResult missing distance property');
    }
  }

  /**
   * Verify the moveResult is as expected.
   *
   * @param {Object} doc - The contentDocument for the frame under test.
   * @param {Number} expectedPrev - The number expected for prevTargetIndex.
   * @param {Number} expectedCurr - The number expected for currTargetIndex.
   * @param {Object} result - The moveResult object from horizontalPager.
   */
  function verifyResult (doc, expectedPrev, expectedCurr, result) {
    verifyMoveResult(result);

    const pages = doc.querySelectorAll(`.${targetClass}`);

    const currElement = pages[result.currTargetIndex];
    const currTransform = currElement.style.transform;
    const notCurrent = [...Array(pages.length).keys()];
    notCurrent.splice(result.currTargetIndex, 1);

    // The current completed tranform should be a form of translateX(0)
    currTransform.should.contain(txComplete);

    // The current element should not contain aria-hidden
    const ariaHiddenExists = currElement.hasAttribute('aria-hidden');
    ariaHiddenExists.should.equal(false);

    // All the others should not be that.
    notCurrent.forEach((pageIndex) => {
      const ariaHidden = pages[pageIndex].getAttribute('aria-hidden');
      ariaHidden.should.equal('true');
      const pageTransform = pages[pageIndex].style.transform;
      pageTransform.should.not.contain(txComplete);
    });

    // Make sure the result indexes agree with the expected situation.
    expectedCurr.should.equal(result.currTargetIndex);
    expectedPrev.should.equal(result.prevTargetIndex);
  }

  /**
   * Get horizontalPager and bound verifyResult bound to a particular iframe
   * hosted demo.
   *
   * @param {String} demoId - The id of the desired frame hosting a demo page.
   * @returns {Promise} Resolves to object with `horizontalPager` and `verify`.
   */
  function getDemoSubjects (demoId) {
    const getMethods = {
      [mainFrameId]: window.__testUtils.getHorizontalPagerMain,
      [twoFrameId]: window.__testUtils.getHorizontalPagerTwo
    };

    return getMethods[demoId]().then((horizontalPager) => {
      const demo = document.querySelector(demoId);
      const verify = verifyResult.bind(this, demo.contentDocument);

      return ({
        horizontalPager,
        verify
      });
    });
  }

  describe('main demo tests', function () {
    let horizontalPager;
    let verify;

    before('main demo tests', function () {
      return getDemoSubjects(mainFrameId).then((subjects) => {
        /* eslint-disable prefer-destructuring */
        horizontalPager = subjects.horizontalPager;
        verify = subjects.verify;
        /* eslint-enable prefer-destructuring */
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
        /* eslint-disable prefer-destructuring */
        horizontalPager = subjects.horizontalPager;
        verify = subjects.verify;
        /* eslint-enable prefer-destructuring */
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
