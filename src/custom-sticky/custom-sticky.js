/**
 * Custom Sticky behavior.
 *
 * Moves an element driven by scroll to a target element, where it stops moving,
 * or "sticks".
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */

export class CSDirection {
  static get up () {
    return 'up';
  }
  static get down () {
    return 'down';
  }
  static get left () {
    return 'left';
  }
  static get right () {
    return 'right';
  }
}

class CustomSticky {
  /**
   * @param {Object} options - CustomSticky options.
   * @param {String} options.scrollSelector - Identifies the scroll source.
   * @param {String} options.movingSelector - Identifies the moving element to stick.
   * @param {String|Function} options.target - A selector that uniquely identifies
   * the element to stick to, or a function that returns a Rect that represents
   * the move target.
   * @param {Function} [options.traverseLength] - Retrieves the distance to
   * traverse over before sticking. Defaults to directional distance between target
   * and moving element rects.
   * @param {String} [options.direction] - The direction the moving element should move.
   * 'up', 'down', 'left', or 'right', defaults to 'up'.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 150.
   * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
   * Defaults to the appropriate translation for the direction.
   * @param {Function} [options.notify] - Called when the moving element sticks or becomes unstuck.
   * Callback receives boolean `true` for stuck, `false` otherwise.
   */
  constructor (options) {
    this.opts = Object.assign({}, {
      resizeWait: 150,
      direction: CSDirection.up
    }, options);

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`); // eslint-disable-line
    }

    let targetRectFn = CustomSticky.optionRectFn(this.opts.target);
    if (!targetRectFn) {
      targetRectFn = () => ({});
      console.warn(`failed to identify targetElement with "${this.opts.target}"`); // eslint-disable-line
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn(`failed to identify moving element with "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    this.notify = this.opts.notify ?
      setTimeout.bind(null, this.opts.notify, 0) : () => false;

    switch (this.opts.direction) {
      case CSDirection.right:
        this.transform = boundY => `translateX(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(targetRectFn().left -
            this.movingElement.getBoundingClientRect().right);
        break;
      case CSDirection.left:
        this.transform = boundY => `translateX(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().left -
            targetRectFn().right);
        break;
      case CSDirection.down:
        this.transform = boundY => `translateY(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(targetRectFn().top -
            this.movingElement.getBoundingClientRect().bottom);
        break;
      default:
      case CSDirection.up:
        this.transform = boundY => `translateY(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().top -
            targetRectFn().bottom);
        break;
    }

    if (typeof this.opts.traverseLength === 'function') {
      this.traverseLength = this.opts.traverseLength;
    }

    if (typeof this.opts.transform === 'function') {
      this.transform = this.opts.transform;
    }

    this.uBoundAccurate = false;
    this.uBound = this.traverseLength();
    if (Number.isNaN(this.uBound) || this.uBound <= 0) {
      console.warn('traverseLength must return a positive number'); // eslint-disable-line
    }

    this.tickScroll = false;
    this.tickResize = false;
    this.started = false;

    this.saveY = 0;
    this.animate = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener('resize', this.onResize, {
      passive: true
    });
  }

  /**
   * Convert selector or function to function that returns Rect.
   *
   * @param {String|Function} selectorOrFn - A selector or function that returns
   * a Rect.
   * @returns {Function} A function that returns a Rect.
   */
  static optionRectFn (selectorOrFn) {
    let rectFn;
    if (typeof selectorOrFn === 'function') {
      rectFn = selectorOrFn;
    } else {
      const el = document.querySelector(selectorOrFn);
      if (el) {
        rectFn = el.getBoundingClientRect.bind(el);
      }
    }
    return rectFn;
  }

  /**
   * Throttled resize event handler.
   * Calculates a new top bound for the scroll animation.
   */
  onResize () {
    if (!this.tickResize) {
      this.tickResize = true;
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          this.updateResize(this.scrollSource.scrollTop);
          this.tickResize = false;
        });
      }, this.opts.resizeWait);
    }
  }

  /**
   * Throttled scroll event handler.
   */
  onScroll () {
    if (!this.tickScroll) {
      this.tickScroll = true;
      window.requestAnimationFrame(() => {
        this.updateScroll(this.scrollSource.scrollTop);
        this.tickScroll = false;
      });
    }
  }

  /**
   * Does the work of the resize event.
   * Update the travel upper bound, saveY, and movingElement.
   *
   * @param {Number} y - The current scrolTop y value.
   */
  updateResize (y) {
    const previousTransform = this.movingElement.style.transform;

    // Always update uBound to the new value
    this.movingElement.style.transform = this.transform(0);
    /* eslint-disable no-unused-expressions */
    // Force any incidental changes to take hold right now
    window.getComputedStyle(this.movingElement).transform;
    /* eslint-enable no-unused-expressions */
    this.uBound = this.traverseLength();

    if (this.started) {
      // Reset this and any peers to the new locations
      this.updateScroll(y, true);
    } else {
      // DON'T do anything else to CustomSticky instances that are not started
      this.movingElement.style.transform = previousTransform;
    }
  }

  /**
   * Does the work of the scroll event.
   * Moves the element until it reaches the upper bound.
   * Once stuck, looks to unstick it self when it re-crosses the stuck position.
   *
   * @param {Number} y - The current scrolTop y value.
   * @param {Boolean} [forceAnimate] - Force the animate path.
   */
  updateScroll (y, forceAnimate) {
    if (!this.uBoundAccurate && !forceAnimate) {
      this.uBoundAccurate = true;
      // Empirical testing reveals this is more accurate sometimes.
      const uBound = this.traverseLength();
      if (uBound > this.uBound) {
        this.uBound = uBound;
      }
    }

    if (this.animate || y === 0 || forceAnimate) {
      const fastScrollUp = !this.animate && y === 0 && !forceAnimate;
      const shouldStick = this.uBound <= y;
      const boundedY = Math.min(y, this.uBound);

      this.saveY = boundedY;
      this.movingElement.style.transform = this.transform(boundedY);

      if (shouldStick) {
        this.animate = false;
        this.notify(true);
      } else if (fastScrollUp) {
        this.animate = true;
        this.notify(false);
      }
    } else {
      this.animate = y < this.uBound;

      if (this.animate) {
        this.notify(false);
      }
    }
  }

  /**
   * Start the custom sticky behavior.
   *
   * @param {Number} [startY] - A y value to start at. Will not scroll if current
   * scroll position is already beyond startY.
   */
  start (startY) {
    this.scrollSource.addEventListener('scroll', this.onScroll, {
      passive: true
    });

    this.started = true;

    const y = this.scrollSource.scrollTop;
    const shouldScroll = startY !== 'undefined' && y < startY;
    const shouldStick = shouldScroll && startY >= this.uBound;

    this.updateScroll(y, true);
    this.animate = y < this.uBound;
    this.notify(shouldStick || !this.animate);

    if (shouldScroll) {
      this.scrollSource.scrollTop = startY;
    }
  }

  /**
   * Stop the custom sticky behavior.
   */
  stop () {
    this.scrollSource.removeEventListener('scroll', this.onScroll);
    this.started = false;
  }
}

/**
 * Create public interface to custom sticky behavior.
 *
 * @param {Object} options - customSticky options.
 * @param {String} options.scrollSelector - Identifies the scroll source element.
 * @param {String} options.movingSelector - Identifies the moving element that sticks.
 * @param {String|Function} options.target - A selector that uniquely identifies
 * the element to stick to, or a function that returns a Rect that represents
 * the move target.
 * @param {Function} [options.traverseLength] - Gets the distance to travel before sticking.
 * Defaults to the distance between target and moving element rects.
 * @param {String} [options.direction] - 'up', 'down', 'left', or 'right'.
 * The general direction the moving element should move. Defaults to 'up'.
 * @param {Number} [options.resizeWait] - Milliseconds to wait before recalculating on resize event.
 * (Throttles the resize event). Defaults to 350.
 * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
 * Defaults to the appropriate translation for the direction.
 * @param {Function} [options.notify] - Called when the moving element sticks or becomes unstuck.
 * Callback receives boolean `true` for stuck, `false` otherwise.
 */
export function createCustomSticky (options = {}) {
  const customSticky = new CustomSticky(options);

  return {
    getUpdateResize: () => customSticky.updateResize.bind(customSticky),
    getUpdateScroll: () => customSticky.updateScroll.bind(customSticky),
    getLastY: () => customSticky.saveY,
    /**
     * @param {Array} [peers] - Collection of CustomSticky objects listening on
     * the same scroll source that should be started with this CustomSticky and
     * serviced in one RAF.
     *
     * @param {Number} [startY] - A y value to start at.
     */
    start: (peers, startY) => {
      const startedWithPeers = Array.isArray(peers) && peers.length > 0;

      if (startedWithPeers) {
        const selfUpdateScroll = CustomSticky.prototype.updateScroll.bind(customSticky);
        const peerUpdateScrolls = peers.map(peer => peer.getUpdateScroll());

        customSticky.updateScroll = (y, force) => {
          selfUpdateScroll(y, force);
          peerUpdateScrolls.forEach(update => update(y, force));
        };

        const selfUpdateResize = CustomSticky.prototype.updateResize.bind(customSticky);
        const peerUpdateResizes = peers.map(peer => peer.getUpdateResize());

        customSticky.updateResize = (y) => {
          selfUpdateResize(y);
          peerUpdateResizes.forEach(update => update(y));
        };
      }

      customSticky.start(startY);
    },
    stop: customSticky.stop.bind(customSticky)
  };
}

export default createCustomSticky;
