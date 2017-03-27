/**
 * horizontal-pager
 *
 * A small, fast, no-dep, horizontal pager.
 * Features:
 *  1.  Horizontal touch navigates to next/prev pages.
 *  2.  Can navigate to a page by relative distance, or absolute index.
 *  3.  Initial render at any page.
 *  4.  Uses `requestAnimationFrame` aligned (decoupled) animations.
 *  5.  Does not interfere with vertical/complex page interactions.
 *  6.  Tracks finger when down, then ease-out.
 *  7.  Edge resistance.
 *  8.  Minimal DOM update approach.
 *  9.  Passive event listeners.
 * 10.  When finger up and navigation certain to complete, calls `willComplete`
 *      callback (optional).
 * 11.  Optional `done` callback for notification after navigation complete.
 * 12.  A css class identifies scroll level items (pages).
 * 13. 8.5k min bundle, 2.5k gzip
 *
 * Missing:
 *   1.  No continuous option (last-wraps-to-first or vice-versa).
 *   2.  No touch velocity considerations.
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
    const noop = () => {};

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

    this.notifyWillComplete = typeof this.opts.willComplete === 'function' ?
      setTimeout.bind(null, this.opts.willComplete, 0) : noop;
    this.notifyDone = typeof this.opts.done === 'function' ?
      setTimeout.bind(null, this.opts.done, 0) : noop;

    this.targetIndex = this.opts.startIndex;
    this.dataId = 'data-hpid';
    this.targetWidth = 0;
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

    if (this.setupTargets() > 1) {
      this.addEventListeners();
    }
  }

  /**
   * Wireup events.
   * @private
   */
  addEventListeners () {
    const options = {
      passive: true
    };

    document.addEventListener('touchstart', this.onStart, options);
    document.addEventListener('mousedown', this.onStart, options);
    document.addEventListener('touchmove', this.onMove, options);
    document.addEventListener('mousemove', this.onMove, options);
    document.addEventListener('touchend', this.onEnd, options);
    document.addEventListener('mouseup', this.onEnd, options);
  }

  /**
   * Setup the scroll targets (pages).
   * @private
   *
   * @returns {Number} The number of scroll targets found.
   */
  setupTargets () {
    let style;
    let i;
    const { targetClass, startIndex } = this.opts;

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

    return this.targets.length;
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
   * If animation done, complete it and signal done.
   * @private
   *
   * @param {Boolean} targetDone - True if the scroll target is done, false otherwise.
   * @param {Boolean} nextDone - True if the next page is done, false otherwise.
   * @param {Boolean} prevDone - True if the prev page is done, false otherwise.
   * @param {Boolean} styleOnly - True if only update styles.
   */
  completeAnimations (targetDone, nextDone, prevDone, styleOnly) {
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

      if (!styleOnly) {
        this.notifyDone(direction);
      }
    }

    if (!styleOnly && (targetDone || nextDone || prevDone)) {
      this.target = null;
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
    if (done && Math.abs(value) < this.targetWidth) {
      return (100 * (value < 0 ? -1 : 1));
    }
    return (value / this.targetWidth) * 100;
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
    const threshold = this.targetWidth * this.opts.scrollThreshold;
    const translateX = this.currentX - this.startX;

    return {
      willComplete: Math.abs(translateX) > threshold && !this.atEdge,
      movingLeft: translateX > 0 // true if moving left to prev, swiping right.
    };
  }

  /**
   * Get the next sibling of the given target that has the targetClass.
   * @private
   *
   * @param {Object} target - The HTMLElement to evaluate.
   * @returns {Object} The nextElementSibling or null if none found.
   */
  getNextSibling (target) {
    const targetClass = this.opts.targetClass;
    const nextSib = target.nextElementSibling;
    const nextOk = nextSib && nextSib.classList.contains(targetClass);
    return nextOk ? nextSib : null;
  }

  /**
   * Get the previous sibling of the given target that has the targetClass.
   * @private
   *
   * @param {Object} target - The HTMLElement to evaluate.
   * @returns {Object} The previousElementSibling or null if none found.
   */
  getPrevSibling (target) {
    const targetClass = this.opts.targetClass;
    const prevSib = target.previousElementSibling;
    const prevOk = prevSib && prevSib.classList.contains(targetClass);
    return prevOk ? prevSib : null;
  }

  /**
   * touchstart handler, passive.
   * Gets called once per touch (two fingers = two calls), but limits to first.
   * @private
   *
   * @param {Object} evt - The TouchEvent object.
   */
  onStart (evt) {
    if (this.touching) {
      return;
    }

    const newTarget = this.targets[this.targetIndex];

    this.targetWidth = newTarget.getBoundingClientRect().width;
    this.startX = evt.pageX || evt.touches[0].pageX;
    this.startY = evt.pageY || evt.touches[0].pageY;
    this.currentX = this.startX;

    this.resetAnimations(newTarget);

    this.target = newTarget;
    this.nextSib = this.getNextSibling(newTarget);
    this.prevSib = this.getPrevSibling(newTarget);

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
   * touchmove handler, passive.
   * Gets called tons.
   * Heavy lifting moved to RAF handler `update`.
   * Sets this.currentX. Sets this.isVertical once per touch (limited to one).
   * @private
   *
   * @param {Object} evt - The TouchEvent object.
   */
  onMove (evt) {
    this.currentX = evt.pageX || evt.touches[0].pageX;

    if (typeof this.isVertical === 'undefined') {
      this.isVertical = (
        Math.abs(this.currentX - this.startX) <
          Math.abs((evt.pageY || evt.touches[0].pageY) - this.startY)
      );
    }

    if (this.isVertical) {
      this.currentX = this.startX;
    }
  }

  /**
   * touchend handler, passive.
   * Gets called once per touch (two fingers = two calls), but limits to first.
   * @private
   */
  onEnd () {
    if (!this.touching) {
      return;
    }
    this.touching = false;

    const { willComplete, movingLeft } = this.touchStatus();

    this.targetX = 0;

    if (willComplete) {
      this.targetX = movingLeft ? this.targetWidth : -this.targetWidth;

      if (!this.willCompleteOnce) {
        this.willCompleteOnce = true;
        const direction = movingLeft ? -1 : 1;
        this.targetIndex += direction;
        this.notifyWillComplete(direction);
      }
    }
  }

  /**
   * The animation frame handler.
   * @private
   */
  update (complete) {
    if (!this.target) {
      return;
    }

    this.rafs.push(requestAnimationFrame(this.update.bind(this, complete)));

    // Calc translateX units. If not touching, ease out.
    if (this.touching) {
      this.translateX = this.currentX - this.startX;

      // Detect edge, add resistance and limit
      this.atEdge = (!this.prevSib && this.translateX > 0) ||
        (!this.nextSib && this.translateX < 0);
      if (this.atEdge) {
        this.translateX = this.translateX / (
          (Math.abs(this.translateX) / this.targetWidth) + 1
        );
      }
    } else {
      this.translateX += (this.targetX - this.translateX) / 4;
    }
    const nextX = (this.translateX + this.targetWidth).toFixed(6);
    const prevX = (this.translateX - this.targetWidth).toFixed(6);

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

    // Complete
    if (typeof complete === 'function') {
      complete(targetDone, nextDone, prevDone);
    } else {
      this.completeAnimations(targetDone, nextDone, prevDone);
    }
  }

  /**
   * Schedule scroll animation without touch.
   * @private
   *
   * @param {Number} distance - The value determines the number of targets to
   * animate ahead (or behind) to. The sign determines the direction, positive
   * is next, negative is prev.
   */
  animate (distance) {
    const moveNext = distance > 0;
    const rangeCheck = this.targetIndex + distance >= 0 &&
      this.targetIndex + distance <= this.targets.length - 1;
    const edgeCheck = moveNext ?
      this.targetIndex < this.targets.length - 1 : this.targetIndex > 0;

    if (distance && rangeCheck && edgeCheck) {
      this.target = null;
      this.resetAnimations();

      let fullWidth;
      let originalWidth;
      let lastWidthCount;

      requestAnimationFrame(() => {
        this.target = this.targets[this.targetIndex];
        this.targetWidth = this.target.getBoundingClientRect().width;
        this.prevSib = this.getPrevSibling(this.target);
        this.nextSib = this.getNextSibling(this.target);

        this.currentX = this.currentX || 0;
        this.startX = this.currentX;
        this.translateX = this.currentX - this.startX;
        this.targetX = this.targetWidth * distance * -1;
        this.touching = false;

        lastWidthCount = 0;
        originalWidth = this.targetWidth;
        fullWidth = this.targetWidth * Math.abs(distance);

        this.targetIndex += distance;
        this.notifyWillComplete(distance);

        if (Math.abs(distance) === 1) {
          this.rafs.push(requestAnimationFrame(this.update));
        } else {
          this.rafs.push(requestAnimationFrame(this.update.bind(this, () => {
            const widthCount = Math.trunc(
              Math.abs(this.translateX) / originalWidth
            );
            const diff = fullWidth - Math.abs(this.translateX);

            if (diff < this.opts.doneThreshold) {
              this.completeAnimations(false, moveNext, !moveNext);
            } else if (widthCount - lastWidthCount > 0) {
              lastWidthCount = widthCount;

              this.completeAnimations(false, moveNext, !moveNext, true);

              this.targetWidth += originalWidth;

              if (moveNext) {
                this.prevSib = this.target;
                this.target = this.nextSib;
                this.nextSib = this.getNextSibling(this.target);
              } else {
                this.nextSib = this.target;
                this.target = this.prevSib;
                this.prevSib = this.getPrevSibling(this.target);
              }
            }
          })));
        }
      });
    }
  }

  /**
   * Move to the next targetClass (page).
   * If at the end, does nothing.
   * @public
   */
  next () {
    this.animate(1);
  }

  /**
   * Move to the previous targetClass (page).
   * If at the beginning, does nothing.
   * @public
   */
  prev () {
    this.animate(-1);
  }

  /**
   * Move N from current targetClass (page).
   * @public
   *
   * @param {Number} distance - The number of pages to move forward (+) or back (-)
   */
  moveRel (distance) {
    this.animate(distance);
  }

  /**
   * Move to the Nth targetClass (page).
   * @public
   *
   * @param {Number} index - The zero-based index to move to.
   */
  moveAbs (index) {
    this.animate(index - this.targetIndex);
  }

  /**
   * @returns {Number} The number of targetClass targets.
   */
  targetCount () {
    return this.targets.length;
  }

  /**
   * Call to stop animations and events.
   * Requires browser.
   * @public
   */
  destroy () {
    this.resetAnimations();
    document.removeEventListener('touchstart', this.onStart);
    document.removeEventListener('mousedown', this.onStart);
    document.removeEventListener('touchmove', this.onMove);
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('touchend', this.onEnd);
    document.removeEventListener('mouseup', this.onEnd);
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
    destroy: horizontalPager.destroy.bind(horizontalPager),
    next: horizontalPager.next.bind(horizontalPager),
    prev: horizontalPager.prev.bind(horizontalPager),
    moveRel: horizontalPager.moveRel.bind(horizontalPager),
    moveAbs: horizontalPager.moveAbs.bind(horizontalPager),
    targetCount: horizontalPager.targetCount.bind(horizontalPager)
  };
}
