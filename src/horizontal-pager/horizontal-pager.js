/**
 * horizontal-pager
 * A small, fast, no-dep, horizontal pager.
 *
 * Copyright (c) 2017-2018 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise, document, setTimeout, requestAnimationFrame, cancelAnimationFrame */

/* eslint-disable import/no-unresolved */
import { createPassiveEventHandlerOption } from '../utils/passiveEvent';
/* eslint-enable import/no-unresolved */

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
   * @param {Boolean} [options.continuous] - True allows the ends to wrap around.
   * Defaults to false.
   * @param {Boolean} [options.addParentStyles] - False disables the adding
   * of styles to the parent of targetClass elements. Defaults to true.
   */
  constructor (options) {
    const noop = () => {};

    this.opts = Object.assign({}, {
      targetClass: '',
      startIndex: 0,
      doneThreshold: 1,
      scrollThreshold: 0.35,
      continuous: false,
      addParentStyles: true
    }, options);

    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);

    this.notifyWillComplete = typeof this.opts.willComplete === 'function'
      ? setTimeout.bind(null, this.opts.willComplete, 0) : noop;
    this.notifyDone = typeof this.opts.done === 'function'
      ? setTimeout.bind(null, this.opts.done, 0) : noop;

    this.lastTargetIndex = this.opts.startIndex;
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
    this.animating = false;
    this.willCompleteOnce = false;
    this.isVertical = undefined;
    this.targets = [];
    this.rafs = [];

    if (this.setupTargets() > 1) {
      this.addEventListeners();
    }

    // Special case flag, if continuous and two slides:
    this.continuousTwo = this.targets.length === 2 && this.opts.continuous;
  }

  /**
   * Wireup events.
   * @private
   */
  addEventListeners () {
    const options = createPassiveEventHandlerOption();

    document.addEventListener('touchstart', this.onStart, options);
    document.addEventListener('touchmove', this.onMove, options);
    document.addEventListener('touchend', this.onEnd, options);
  }

  /**
   * Setup the scroll targets (pages).
   * @private
   *
   * @returns {Number} The number of scroll targets found.
   */
  setupTargets () {
    const parentStyle = {
      position: 'relative',
      width: '100%',
      'overflow-x': 'hidden'
    };
    const parents = [];
    const { targetClass, startIndex, addParentStyles } = this.opts;

    this.targets = document.querySelectorAll(`.${targetClass}`);

    for (let i = 0; i < this.targets.length; i++) {
      if (addParentStyles) {
        const parent = this.targets[i].parentElement;
        if (!parents.includes(parent)) {
          parents.push(parent);
        }
      }

      this.targets[i].setAttribute(this.dataId, i);

      if (i !== startIndex) {
        this.targets[i].setAttribute('aria-hidden', true);
      }

      const { style } = this.targets[i];
      style.position = (i === startIndex) ? 'static' : 'absolute';
      style.transform = `translate3d(${((i - startIndex) * 100)}%, 0px, 0px)`;
      style.display = (i === startIndex) ? 'block' : 'none';
      style.top = 0;
      style.left = 0;
      style.width = '100%';
    }

    if (parents.length === 1) {
      Object.assign(parents[0].style, parentStyle);
    } else if (parents.length > 1) {
      /* eslint-disable no-console */
      console.error(
        `horizontal-pager: '.${targetClass}' elements MUST be siblings.`
      );
      /* eslint-enable no-console */
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

        const nextStyle = (this.nextSib && this.nextSib.getAttribute(this.dataId) !== newId)
          ? this.nextSib.style : {};
        const prevStyle = (this.prevSib && this.prevSib.getAttribute(this.dataId) !== newId)
          ? this.prevSib.style : {};
        const targetStyle = (this.target && this.target.getAttribute(this.dataId) !== newId)
          ? this.target.style : {};

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
   * @param {Boolean} [styleOnly] - True if only update styles.
   */
  completeAnimations (targetDone, nextDone, prevDone, styleOnly) {
    if (nextDone || prevDone) {
      const nextStyle = this.nextSib ? this.nextSib.style : {};
      const prevStyle = this.prevSib ? this.prevSib.style : {};

      this.target.style.position = 'absolute';
      this.target.style.willChange = 'initial';
      this.target.style.display = 'none';
      this.target.setAttribute('aria-hidden', true);

      if (nextDone) {
        nextStyle.position = 'static';
        nextStyle.display = 'block';
        this.nextSib.removeAttribute('aria-hidden');
        if (this.target.length > 2) {
          prevStyle.willChange = 'initial';
          prevStyle.display = 'none';
        }
      } else {
        prevStyle.position = 'static';
        prevStyle.display = 'block';
        this.prevSib.removeAttribute('aria-hidden');
        if (this.target.length > 2) {
          nextStyle.willChange = 'initial';
          nextStyle.display = 'none';
        }
      }

      if (!styleOnly) {
        this.notifyDone(this.createMoveResult());
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
    const { targetClass } = this.opts;
    let nextSib = target.nextElementSibling;
    let nextOk = nextSib && nextSib.classList.contains(targetClass);

    if (!nextOk && this.opts.continuous) {
      /* eslint-disable prefer-destructuring */
      nextSib = this.targets[0];
      /* eslint-enable prefer-destructuring */
      nextOk = true;
    }

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
    const { targetClass } = this.opts;
    let prevSib = target.previousElementSibling;
    let prevOk = prevSib && prevSib.classList.contains(targetClass);

    if (!prevOk && this.opts.continuous) {
      prevSib = this.targets[this.targets.length - 1];
      prevOk = true;
    }

    return prevOk ? prevSib : null;
  }

  /**
   * Create a moveResult object.
   * Call after updateTargetIndex, use to deliver moveResult to callbacks.
   * @private
   *
   * @returns {Object} A moveResult Object with
   *   currTargetIndex, prevTargetIndex, and distance.
   */
  createMoveResult () {
    return {
      currTargetIndex: this.targetIndex,
      prevTargetIndex: this.lastTargetIndex,
      distance: this.targetDistance
    };
  }

  /**
   * Given a distance (-1, +1), calculate and update the next target index.
   * Works in continuous mode or not.
   * Updates this.lastTargetIndex, this.targetDistance, this.targetIndex.
   * @private
   *
   * @param {Number} distance - The distance to calc from the current index.
   */
  updateTargetIndex (distance) {
    this.lastTargetIndex = this.targetIndex;
    this.targetDistance = distance;
    const { length } = this.targets;
    const nextIndex = this.targetIndex + distance;
    const nextTargetIndex = (length + (nextIndex % length)) % length;
    this.targetIndex = nextTargetIndex;
  }

  /**
   * Get PageX value, support multiple event interfaces.
   *
   * @param {Object} evt - A Touch Event
   * @returns {Number} The page X value.
   */
  static getPageX (evt) {
    let result = 0;
    const hasPageX = typeof evt.pageX !== 'undefined';

    if (hasPageX) {
      result = evt.pageX;
    } else {
      const hasTouches = typeof evt.touches !== 'undefined';
      if (hasTouches && evt.touches.length > 0) {
        result = evt.touches[0].pageX;
      }
    }

    return result;
  }

  /**
   * Get PageY value, support multiple event interfaces.
   *
   * @param {Object} evt - A Touch Event
   * @returns {Number} The page Y value.
   */
  static getPageY (evt) {
    let result = 0;
    const hasPageY = typeof evt.pageY !== 'undefined';

    if (hasPageY) {
      result = evt.pageY;
    } else {
      const hasTouches = typeof evt.touches !== 'undefined';
      if (hasTouches && evt.touches.length > 0) {
        result = evt.touches[0].pageY;
      }
    }

    return result;
  }

  /**
   * touchstart handler, passive.
   * Gets called once per touch (two fingers = two calls), but limits to first.
   * @private
   *
   * @param {Object} evt - The TouchEvent object.
   */
  onStart (evt) {
    if (this.touching || this.animating) {
      return;
    }

    const newTarget = this.targets[this.targetIndex];

    this.targetWidth = newTarget.getBoundingClientRect().width;
    this.startX = HorizontalPager.getPageX(evt);
    this.startY = HorizontalPager.getPageY(evt);
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
      this.nextSib.style.display = 'block';
      this.nextSib.style.willChange = 'transform';
    }
    if (this.prevSib) {
      this.prevSib.style.display = 'block';
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
    this.currentX = HorizontalPager.getPageX(evt);

    if (typeof this.isVertical === 'undefined') {
      this.isVertical = (
        Math.abs(this.currentX - this.startX)
        < Math.abs(HorizontalPager.getPageY(evt) - this.startY)
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
        this.updateTargetIndex(direction);
        this.notifyWillComplete(this.createMoveResult());
      }
    } else {
      if (this.prevSib) {
        const prevStyle = this.prevSib.style;
        prevStyle.display = 'none';
        prevStyle.willChange = 'initial';
      }
      if (this.nextSib) {
        const nextStyle = this.nextSib.style;
        nextStyle.display = 'none';
        nextStyle.willChange = 'initial';
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

      if (!this.opts.continuous) {
        // Detect edge, add resistance and limit
        this.atEdge = (!this.prevSib && this.translateX > 0)
          || (!this.nextSib && this.translateX < 0);
        if (this.atEdge) {
          this.translateX = this.translateX / (
            (Math.abs(this.translateX) / this.targetWidth) + 1
          );
        }
      }
    } else {
      this.translateX += (this.targetX - this.translateX) / 4;
    }
    const skipNext = this.continuousTwo && this.translateX > 0;
    const skipPrev = this.continuousTwo && this.translateX < 0;
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
    if (this.nextSib && !skipNext) {
      this.nextSib.style.transform = `translateX(${
        (nextDone ? 0 : this.transX(targetDone, nextX))
      }%)`;
    }
    if (this.prevSib && !skipPrev) {
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
   * @returns {Boolean} true if animation occurred, false otherwise.
   */
  animate (distance) {
    const moveNext = distance > 0;
    let edgeCheck = true;
    let rangeCheck;

    if (this.opts.continuous) {
      rangeCheck = Math.abs(distance) <= this.targets.length;
    } else {
      rangeCheck = this.targetIndex + distance >= 0
        && this.targetIndex + distance <= this.targets.length - 1;
      edgeCheck = moveNext
        ? this.targetIndex < this.targets.length - 1 : this.targetIndex > 0;
    }

    const canAnimate = distance && rangeCheck && edgeCheck && !this.animating;

    if (canAnimate) {
      return new Promise((resolve) => {
        this.animating = true;
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

          if (this.prevSib) {
            this.prevSib.style.display = 'block';
          }
          if (this.nextSib) {
            this.nextSib.style.display = 'block';
          }

          lastWidthCount = 0;
          originalWidth = this.targetWidth;
          fullWidth = this.targetWidth * Math.abs(distance);

          this.updateTargetIndex(distance);
          this.notifyWillComplete(this.createMoveResult());

          if (Math.abs(distance) === 1) {
            this.rafs.push(requestAnimationFrame(this.update.bind(this,
              (...doneFlags) => {
                this.completeAnimations(...doneFlags);
                if (doneFlags.includes(true)) {
                  this.animating = false;
                  resolve(this.createMoveResult());
                }
              })));
          } else {
            this.rafs.push(requestAnimationFrame(this.update.bind(this, () => {
              const widthCount = Math.trunc(
                Math.abs(this.translateX) / originalWidth
              );
              const diff = fullWidth - Math.abs(this.translateX);

              if (diff < this.opts.doneThreshold) {
                this.completeAnimations(false, moveNext, !moveNext);
                this.animating = false;
                resolve(this.createMoveResult());
              } else if (widthCount - lastWidthCount > 0) {
                lastWidthCount = widthCount;

                this.completeAnimations(false, moveNext, !moveNext, true);

                this.targetWidth += originalWidth;

                if (moveNext) {
                  this.prevSib = this.target;
                  this.target = this.nextSib;
                  this.nextSib = this.getNextSibling(this.target);
                  if (this.nextSib) {
                    this.nextSib.style.display = 'block';
                  }
                } else {
                  this.nextSib = this.target;
                  this.target = this.prevSib;
                  this.prevSib = this.getPrevSibling(this.target);
                  if (this.prevSib) {
                    this.prevSib.style.display = 'block';
                  }
                }
              }
            })));
          }
        });
      });
    }
    return Promise.resolve(null);
  }

  /**
   * Move to the next targetClass (page).
   * If at the end, does nothing.
   * @public
   *
   * @returns {Boolean} true if animation occurred, false otherwise.
   */
  moveNext () {
    return this.animate(1);
  }

  /**
   * Move to the previous targetClass (page).
   * If at the beginning, does nothing.
   * @public
   *
   * @returns {Boolean} true if animation occurred, false otherwise.
   */
  movePrev () {
    return this.animate(-1);
  }

  /**
   * Move N from current targetClass (page).
   * @public
   *
   * @param {Number} distance - The number of pages to move forward (+) or back (-)
   * @returns {Boolean} true if animation occurred, false otherwise.
   */
  moveRel (distance) {
    return this.animate(distance);
  }

  /**
   * Move to the Nth targetClass (page).
   * @public
   *
   * @param {Number} index - The zero-based index to move to.
   * @returns {Boolean} true if animation occurred, false otherwise.
   */
  moveAbs (index) {
    return this.animate(index - this.targetIndex);
  }

  /**
   * @public
   * @returns {Number} The number of targetClass targets.
   */
  getTargetCount () {
    return this.targets.length;
  }

  /**
   * @public
   * @returns {Number} The current target index.
   */
  getTargetIndex () {
    return this.targetIndex;
  }

  /**
   * @public
   * @returns {Number} The last (previous) target index.
   */
  getPrevTargetIndex () {
    return this.lastTargetIndex;
  }

  /**
   * Call to stop animations and events.
   * Requires browser.
   * @public
   */
  destroy () {
    this.resetAnimations();
    document.removeEventListener('touchstart', this.onStart);
    document.removeEventListener('touchmove', this.onMove);
    document.removeEventListener('touchend', this.onEnd);
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
    next: horizontalPager.moveNext.bind(horizontalPager),
    prev: horizontalPager.movePrev.bind(horizontalPager),
    moveRel: horizontalPager.moveRel.bind(horizontalPager),
    moveAbs: horizontalPager.moveAbs.bind(horizontalPager),
    targetCount: horizontalPager.getTargetCount.bind(horizontalPager),
    currTargetIndex: horizontalPager.getTargetIndex.bind(horizontalPager),
    prevTargetIndex: horizontalPager.getPrevTargetIndex.bind(horizontalPager)
  };
}
