/**
 * Custom Sticky behavior: A specialized, composable scroll animation.
 *
 * Moves an element driven by scroll to a target element, where it stops moving,
 * or "sticks".
 *
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

import { createPassiveEventHandlerOption } from '../utils/passive-event';
import { createIntersectionObserver } from './intersection-observer';

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
   * @param {Function} [options.animationLength] - Gets the vertical distance to animate over.
   * The animation will try to complete within the vertical distance specified.
   * Defaults to window.innerHeight.
   * @param {String} [options.direction] - The direction the moving element should move.
   * 'up', 'down', 'left', or 'right', defaults to 'up'.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 150.
   * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
   * Defaults to the appropriate translation for the direction.
   * @param {Function} [options.notify] - Called when the moving element sticks or becomes unstuck.
   * Callback receives boolean `true` for stuck, `false` otherwise.
   * @param {Boolean} [options.alwaysVisible] - True indicates the movingSelector element is
   * always visible and never goes out of the viewport. Defaults to false.
   */
  constructor (options) {
    this.opts = {
      resizeWait: 150,
      direction: CSDirection.up,
      alwaysVisible: false,
      animationLength: () => window.innerHeight,
      ...options
    };

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`);
    }

    let targetRectFn = CustomSticky.optionRectFn(this.opts.target);
    if (!targetRectFn) {
      targetRectFn = () => ({});
      console.warn(`failed to identify targetElement with "${this.opts.target}"`);
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn(`failed to identify moving element with "${this.opts.movingSelector}"`);
    }

    this.notify = this.opts.notify ? setTimeout.bind(null, this.opts.notify, 0) : () => false;

    switch (this.opts.direction) {
      case CSDirection.right:
        this.transform = boundY => `translateX(${boundY}px)`;
        this.traverseLength = () => Math.ceil(
          targetRectFn().left - this.movingElement.getBoundingClientRect().right
        );
        break;
      case CSDirection.left:
        this.transform = boundY => `translateX(${-boundY}px)`;
        this.traverseLength = () => Math.ceil(
          this.movingElement.getBoundingClientRect().left - targetRectFn().right
        );
        break;
      case CSDirection.down:
        this.transform = boundY => `translateY(${boundY}px)`;
        this.traverseLength = () => Math.ceil(
          targetRectFn().top - this.movingElement.getBoundingClientRect().bottom
        );
        break;
      case CSDirection.up:
      default:
        this.transform = boundY => `translateY(${-boundY}px)`;
        this.traverseLength = () => Math.ceil(
          this.movingElement.getBoundingClientRect().top - targetRectFn().bottom
        );
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
      console.warn('traverseLength must return a positive number');
    }

    this.animationLength = this.opts.animationLength();

    this.tickScroll = false;
    this.tickResize = false;
    this.started = false;

    this.yBasisOrigins = {
      [window.innerHeight]: null
    };

    this.yBasis = undefined;
    this.saveY = 0;
    this.animate = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onIntersection = this.onIntersection.bind(this);

    this.yBasisPromise = new Promise((resolve) => {
      this.yBasisResolver = resolve;
    });

    const observer = createIntersectionObserver(this.onIntersection);
    observer.observe(this.movingElement);

    this.passiveEventOption = createPassiveEventHandlerOption();

    window.addEventListener(
      'resize',
      this.onResize,
      this.passiveEventOption
    );
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
   * Create a new yBasis promise and resolver.
   * Only if not alwaysVisible.
   */
  resetYBasisPromise () {
    if (!this.opts.alwaysVisible) {
      this.yBasisPromise = new Promise((resolve) => {
        this.yBasisResolver = resolve;
      });
    }
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
   * Intersection observer callback handler.
   */
  onIntersection (entries) {
    const aoi = entries.filter(e => e.target.isEqualNode(this.movingElement));
    const entry = aoi && aoi.length > 0 ? aoi[0] : null;

    if (entry) {
      const intersected = entry.intersectionRect.width > 0
        || entry.intersectionRect.height > 0;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollTop = this.scrollSource.scrollTop;
      const mustInitOrigin = !this.yBasisOrigins[viewportHeight];

      if (mustInitOrigin) {
        this.yBasisOrigins[viewportHeight] = {
          intersected,
          basis: intersected ? scrollTop : 0
        };
      }

      if (intersected) {
        const fromTop = entry.intersectionRect.top < (viewportHeight / 2);

        const fromSide =
          Math.abs(viewportWidth - entry.intersectionRect.right) < (viewportWidth / 10)
            || entry.intersectionRect.left < (viewportWidth / 10);

        if (!this.yBasisOrigins[viewportHeight].intersected && !fromTop) {
          this.yBasisOrigins[viewportHeight].intersected = true;
          this.yBasisOrigins[viewportHeight].basis = scrollTop;
        }

        this.yBasis = fromTop
          || fromSide ? this.yBasisOrigins[viewportHeight].basis : scrollTop;
      } else {
        this.yBasis = undefined;
      }

      this.yBasisResolver();
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
    this.movingElement.style.transform = this.transform(0);

    // Force any incidental changes to take hold right now
    window.getComputedStyle(this.movingElement).transform;

    this.uBound = this.traverseLength();
    this.animationLength = this.opts.animationLength();

    if (this.started) {
      const viewportHeight = window.innerHeight;
      let yBasisEntry = 0;
      if (this.yBasisOrigins[viewportHeight]) {
        yBasisEntry = this.yBasisOrigins[viewportHeight].basis;
      }
      const progress = this.calculateProgress(y);
      const wouldAnimate = progress < this.uBound && y >= yBasisEntry;

      if (wouldAnimate && !this.animate) {
        this.animate = true;
        this.scrollSource.scrollTop = y + this.uBound;
      } else {
        this.updateScroll(y, true);
        // Set in case stop/start using getLastY
        this.saveY = Math.min(
          y,
          // equation is calculateProgress but solve for y
          (this.animationLength * (Math.min(progress, this.uBound) / this.uBound)) + yBasisEntry
        );
      }
    } else /* if (typeof this.yBasis !== 'undefined') */ {
      this.movingElement.style.transform = previousTransform;
    }
  }

  /**
   * Some browsers (safari) seem incapable of dimensions until scroll.
   * Updates scroll upper bound if required.
   * Works maximum of once.
   *
   * @param {Boolean} ignore - Noop if true.
   */
  browserBugUpdateUbound (ignore) {
    if (ignore || this.uBoundAccurate) {
      return;
    }

    this.uBoundAccurate = true;
    const uBound = this.traverseLength();
    if (uBound > this.uBound) {
      this.uBound = uBound;
    }
  }

  /**
   * Given scroll y, calculate the progress to uBound.
   *
   * @param {Number} y - A scroll y value.
   */
  calculateProgress (y) {
    return this.uBound * ((Math.max(y, this.yBasis) - this.yBasis) / this.animationLength);
  }

  /**
   * Does the work of the scroll event.
   * Updates the element progress until it reaches the upper bound.
   * Once stuck, looks to unstick it self when it re-crosses the stuck position.
   *
   * @param {Number} y - The current scrolTop y value.
   * @param {Boolean} [forceAnimate] - true to force movement.
   */
  updateScroll (y, forceAnimate) {
    if (typeof this.yBasis === 'undefined') {
      return;
    }

    this.browserBugUpdateUbound(forceAnimate);

    const progress = this.calculateProgress(y);
    const top = y === 0;

    if (this.animate || top || forceAnimate) {
      const shouldStick = this.uBound <= progress;
      const fastTop = !this.animate && top && !forceAnimate;
      const transform = Math.min(progress, this.uBound);

      this.saveY = forceAnimate ? this.saveY : y;
      this.movingElement.style.transform = this.transform(transform);

      if (shouldStick) {
        this.animate = false;
        this.notify(true);
      } else if (fastTop) {
        this.animate = true;
        this.notify(false);
      }
    } else {
      this.animate = progress < this.uBound && y >= this.yBasis;
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
    this.yBasisPromise.then(() => {
      this.scrollSource.addEventListener(
        'scroll',
        this.onScroll,
        this.passiveEventOption
      );

      this.started = true;

      const y = this.scrollSource.scrollTop;
      const shouldScroll = typeof startY !== 'undefined' && y < startY;

      if (shouldScroll) {
        this.scrollSource.scrollTop = startY;
      } else {
        this.updateScroll(y, true);
      }
    });
  }

  /**
   * Stop the custom sticky behavior.
   */
  stop () {
    this.scrollSource.removeEventListener('scroll', this.onScroll);
    this.started = false;
    this.resetYBasisPromise();
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
 * @param {Function} [options.animationLength] - Gets the vertical distance to animate over.
 * The animation will try to complete within the vertical distance specified.
 * Defaults to window.innerHeight.
 * @param {String} [options.direction] - 'up', 'down', 'left', or 'right'.
 * The general direction the moving element should move. Defaults to 'up'.
 * @param {Number} [options.resizeWait] - Milliseconds to wait before recalculating on resize event.
 * (Throttles the resize event). Defaults to 350.
 * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
 * Defaults to the appropriate translation for the direction.
 * @param {Function} [options.notify] - Called when the moving element sticks or becomes unstuck.
 * Callback receives boolean `true` for stuck, `false` otherwise.
 * @param {Boolean} [options.alwaysVisible] - True indicates the movingSelector element is
 * always visible and never goes out of the viewport. Defaults to false.
 */
export function createCustomSticky (options = {}) {
  const customSticky = new CustomSticky(options);
  let startedPeers;

  return {
    _: {
      getUpdateResize: () => customSticky.updateResize.bind(customSticky),
      getUpdateScroll: () => (y, fa) => customSticky.yBasisPromise.then(() => {
        customSticky.updateScroll(y, fa);
      }),
      reset: customSticky.resetYBasisPromise.bind(customSticky)
    },
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
        const peerUpdateScrolls = peers.map(peer => peer._.getUpdateScroll());

        customSticky.updateScroll = (y, force) => {
          selfUpdateScroll(y, force);
          peerUpdateScrolls.forEach(update => update(y, force));
        };

        const selfUpdateResize = CustomSticky.prototype.updateResize.bind(customSticky);
        const peerUpdateResizes = peers.map(peer => peer._.getUpdateResize());

        customSticky.updateResize = (y) => {
          selfUpdateResize(y);
          peerUpdateResizes.forEach(update => update(y));
        };

        startedPeers = peers;
      } else {
        startedPeers = null;
      }

      customSticky.start(startY);
    },
    stop: () => {
      if (startedPeers) {
        startedPeers.forEach(peer => peer._.reset());
      }

      customSticky.stop();
    }
  };
}

export default createCustomSticky;
