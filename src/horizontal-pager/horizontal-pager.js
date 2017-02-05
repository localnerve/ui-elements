/**
 * horizontal-pager
 *
 * A small, fast, no-dep, horizontal pager.
 * Features:
 *   1.  Horizontal swipes navigate to next/prev page.
 *   2.  Uses requestAnimationFrame aligned (decoupled) animations.
 *   3.  Vertical scrolling supported.
 *   4.  Can start at any page index.
 *   5.  Edge resistance.
 *   6.  Track finger when down, then ease out animation.
 *   7.  Passive event listeners where possible.
 *   8.  When finger up and navigation certain to complete, calls `willComplete`
 *       callback (optional).
 *   9.  Optional `done` callback for notification after navigation complete.
 *   10. Css class identifies scroll level items (pages).
 * Missing:
 *   1.  No continuous option (last-wraps-to-first or vice-versa).
 *   2.  No direct navigate ability (goto directly to page N).
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, setTimeout, requestAnimationFrame, cancelAnimationFrame */

class HorizontalPager {
  /**
   * HorizontalPager constructor.
   * @public
   *
   * @param {Object} options - HorizontalScroller options.
   * @param {String} options.targetClass - The class that identifies the scroll
   * target. Must be supplied.
   * @param {Number} [options.startIndex] - Which scroll target to show initially.
   * Defaults to 0.
   * @param {Number} [options.scrollThreshold] - Less than 1, a decimal
   * percentage beyond which a touch will cause a complete scroll.
   * Defaults to 0.35.
   * @param {Number} [options.doneThreshold] - The translateX pixel value below
   * which to stop animations. Defaults to 1 (Will not animate below 1px).
   * @param {Function} [options.done] - A function to call after a scroll has
   * completed.
   * @param {Function} [options.willComplete] - A function to call when a scroll
   * will complete very soon.
   */
  constructor (options) {
    this.opts = Object.assign({}, {
      targetClass: '',
      startIndex: 0,
      doneThreshold: 1,
      scrollThreshold: 0.35
    }, options);

    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);

    this.targetIndex = this.opts.startIndex;
    this.dataId = 'data-hpid';
    this.initialized = false;
    this.destroyed = false;
    this.targetRect = null;
    this.target = null;
    this.nextSib = null;
    this.prevSib = null;
    this.touching = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.translateX = 0;
    this.targetX = 0;
    this.atEdge = false;
    this.willCompleteOnce = false;
    this.isVertical = undefined;
    this.targets = [];
    this.rafs = [];
  }

  /**
   * Wireup events.
   * @private
   */
  addEventListeners () {
    document.addEventListener('touchstart', this.onStart, {
      passive: true
    });
    document.addEventListener('mousedown', this.onStart, {
      passive: true
    });
    document.addEventListener('touchmove', this.onMove);
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('touchend', this.onEnd, {
      passive: true
    });
    document.addEventListener('mouseup', this.onEnd, {
      passive: true
    });
  }

  /**
   * Setup the scroll targets (pages).
   * @private
   */
  setupTargets () {
    let style;
    let i;
    const targetClass = this.opts.targetClass;
    const startIndex = this.opts.startIndex;

    this.targets = document.querySelectorAll(`.${targetClass}`);

    for (i = 0; i < this.targets.length; i++) {
      this.targets[i].setAttribute(this.dataId, i);
      style = this.targets[i].style;

      style.position = (i === startIndex) ? 'static' : 'absolute';
      style.transform = `translate3d(${((i - startIndex) * 100)}%, 0px, 0px)`;
      style.display = 'block';
      style.top = 0;
      style.left = 0;
      style.width = '100%';
    }
  }

  /**
   * Cancel any pending animation frames and reset styles if will not complete.
   * Does not touch nextTarget, rather, the previous target items in `this`.
   * Presumes nextTarget will be updated after this.
   * @private
   *
   * @param {Object} [newTarget] - The new, next target for paging.
   * If supplied, directs style resets to happen. Will not reset styles for
   * the next target.
   */
  resetAnimations (newTarget) {
    this.rafs.forEach(raf => cancelAnimationFrame(raf));
    this.rafs.length = 0;

    if (newTarget) {
      const { willComplete } = this.touchStatus();

      if (!willComplete) {
        const newId = newTarget.getAttribute(this.dataId);
        const resetStyle = {
          position: 'absolute',
          willChange: 'initial'
        };

        const nextStyle =
          (this.nextSib && this.nextSib.getAttribute(this.dataId) !== newId) ?
            this.nextSib.style : {};
        const prevStyle =
          (this.prevSib && this.prevSib.getAttribute(this.dataId) !== newId) ?
            this.prevSib.style : {};
        const targetStyle =
          (this.target && this.target.getAttribute(this.dataId) !== newId) ?
            this.target.style : {};

        Object.assign(nextStyle, resetStyle);
        Object.assign(prevStyle, resetStyle);
        Object.assign(targetStyle, resetStyle);
      }
    }
  }

  /**
   * Create percentage translateX value.
   * If done, make sure the value is off by 100% magnitude.
   * NOTE: This presumes all targets are the same width.
   * @private
   *
   * @param {Boolean} done - True if done, and adjustment required.
   * Otherwise, pass the value through.
   * @param {Number} value - The value to adjust, if required.
   */
  transX (done, value) {
    if (done && Math.abs(value) < this.targetRect.width) {
      return (100 * (value < 0 ? -1 : 1));
    }
    return (value / this.targetRect.width) * 100;
  }

  /**
   * Get the touch status by calculating the current translateX
   * progress and comparing against the threshold of `completeness`.
   * Also calculates direction.
   * @private
   *
   * @returns {Object} contains two booleans: willComplete and movingLeft.
   */
  touchStatus () {
    const threshold = this.targetRect.width * this.opts.scrollThreshold;
    const translateX = this.currentX - this.startX;

    return {
      willComplete: Math.abs(translateX) > threshold && !this.atEdge,
      movingLeft: translateX > 0 // true if moving left to prev, swiping right.
    };
  }

  /**
   * Check if scroll animation done, stop if it is.
   * @private
   *
   * @param {Boolean} targetDone - True if the scroll target is done, false otherwise.
   * @param {Boolean} nextDone - True if the next page is done, false otherwise.
   * @param {Boolean} prevDone - True if the prev page is done, false otherwise.
   */
  slideDone (targetDone, nextDone, prevDone) {
    if (nextDone || prevDone) {
      const direction = nextDone ? 1 : -1;
      const nextStyle = this.nextSib ? this.nextSib.style : {};
      const prevStyle = this.prevSib ? this.prevSib.style : {};

      this.target.style.position = 'absolute';
      this.target.style.willChange = 'initial';

      if (nextDone) {
        nextStyle.position = 'static';
        prevStyle.willChange = 'initial';
      } else {
        prevStyle.position = 'static';
        nextStyle.willChange = 'initial';
      }

      if (typeof this.opts.done === 'function') {
        setTimeout(this.opts.done, 0, direction);
      }
    }

    if (targetDone || nextDone || prevDone) {
      this.target = null;
    }
  }

  /**
   * touchstart handler, passive.
   * @private
   *
   * @param {Object} evt - The TouchEvent object.
   */
  onStart (evt) {
    const newTarget = this.targets[this.targetIndex];
    if (!newTarget) {
      return;
    }

    this.targetRect = newTarget.getBoundingClientRect();
    this.startX = evt.pageX || evt.touches[0].pageX;
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentX = this.startX;

    this.resetAnimations(newTarget);

    this.target = newTarget;
    this.nextSib = newTarget.nextElementSibling;
    this.prevSib = newTarget.previousElementSibling;

    this.touching = true;
    this.willCompleteOnce = false;
    this.isVertical = undefined;
    this.atEdge = false;

    this.target.style.willChange = 'transform';
    this.target.style.position = 'static';

    if (this.nextSib) {
      this.nextSib.style.willChange = 'transform';
    }
    if (this.prevSib) {
      this.prevSib.style.willChange = 'transform';
    }

    this.rafs.push(requestAnimationFrame(this.update));
  }

  /**
   * touchmove handler.
   * @private
   *
   * @param {Object} evt - The TouchEvent object.
   */
  onMove (evt) {
    if (!this.target) {
      return;
    }

    this.currentX = evt.pageX || evt.touches[0].pageX;

    if (typeof this.isVertical === 'undefined') {
      this.isVertical = (
        Math.abs(this.currentX - this.startX) <
          Math.abs((evt.pageY || evt.touches[0].pageY) - this.startY)
      );
    }

    if (this.isVertical) {
      this.currentX = this.startX;
    } else {
      evt.preventDefault();
    }
  }

  /**
   * touchend handler.
   * @private
   */
  onEnd () {
    if (!this.target) {
      return;
    }

    const { willComplete, movingLeft } = this.touchStatus();

    this.targetX = 0;

    if (willComplete) {
      const direction = movingLeft ? -1 : 1;

      this.targetX = movingLeft ?
        this.targetRect.width : -this.targetRect.width;

      if (!this.willCompleteOnce) {
        this.willCompleteOnce = true;
        this.targetIndex += direction;
        if (typeof this.opts.willComplete === 'function') {
          setTimeout(this.opts.willComplete, 0, direction);
        }
      }
    }

    this.touching = false;
  }

  /**
   * RAF handler.
   * @private
   */
  update () {
    if (!this.target) {
      return;
    }

    this.rafs.push(requestAnimationFrame(this.update));

    // Calc translateX units. If not touching, ease out.
    if (this.touching) {
      this.translateX = this.currentX - this.startX;

      // Detect edge, add resistance and limit
      this.atEdge = (!this.prevSib && this.translateX > 0) ||
        (!this.nextSib && this.translateX < 0);
      if (this.atEdge) {
        this.translateX = this.translateX / (
          (Math.abs(this.translateX) / this.targetRect.width) + 1
        );
      }
    } else {
      this.translateX += (this.targetX - this.translateX) / 4;
    }
    const nextX = (this.translateX + this.targetRect.width).toFixed(6);
    const prevX = (this.translateX - this.targetRect.width).toFixed(6);

    // Detect animation done
    const targetDone = this.isVertical || (
      !this.touching && Math.abs(this.translateX) < this.opts.doneThreshold
    );
    const nextDone = Math.abs(nextX) < this.opts.doneThreshold;
    const prevDone = Math.abs(prevX) < this.opts.doneThreshold;

    // Update transform translateX
    this.target.style.transform = `translateX(${
      (targetDone ? 0 : this.transX(nextDone || prevDone, this.translateX))
    }%)`;
    if (this.nextSib) {
      this.nextSib.style.transform = `translateX(${
        (nextDone ? 0 : this.transX(targetDone, nextX))
      }%)`;
    }
    if (this.prevSib) {
      this.prevSib.style.transform = `translateX(${
        (prevDone ? 0 : this.transX(targetDone, prevX))
      }%)`;
    }

    // If slide done, cleanup
    this.slideDone(targetDone, nextDone, prevDone);
  }

  /**
   * Call to start browser event handling, and render targets into position.
   * Requires browser.
   * @public
   */
  initialize () {
    if (!this.initialized) {
      this.initialized = true;
      this.addEventListeners();
      this.setupTargets();
    }
  }

  /**
   * Call to cleanup, stop animations, and events.
   * Requires browser.
   * @public
   */
  destroy () {
    if (this.initialized && !this.destroyed) {
      this.destroyed = true;
      this.resetAnimations();
      document.removeEventListener('touchstart', this.onStart);
      document.removeEventListener('mousedown', this.onStart);
      document.removeEventListener('touchmove', this.onMove);
      document.removeEventListener('mousemove', this.onMove);
      document.removeEventListener('touchend', this.onEnd);
      document.removeEventListener('mouseup', this.onEnd);
    }
  }
}

/**
 * Create the public interface for HorizontalPager.
 * @see HorizontalPager constructor for options details.
 *
 * @param {Object} options - HorizontalPager options.
 * @param {String} options.targetClass - classname to identify pager targets.
 * @returns {Object} The public interface for HorizontalPager.
 */
export default function createHorizontalPager (options) {
  const horizontalPager = new HorizontalPager(options);

  return {
    initialize: horizontalPager.initialize.bind(horizontalPager),
    destroy: horizontalPager.destroy.bind(horizontalPager)
  };
}
