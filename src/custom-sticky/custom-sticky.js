/**
 * Custom Sticky behavior.
 *
 * Moves an element driven by scroll to a target element, where it stops moving.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
/* eslint-disable import/no-unresolved */
import { createSimpleScrollIntersection, SSIConst } from './simple-scroll-intersection';

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
   * update. Disregards more resize events during this time. Defaults to 350.
   * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
   * Defaults to the appropriate translation for the direction.
   * @param {Function} [options.notify] - Called when the moving element sticks or becomes unstuck.
   * Callback receives boolean `true` for stuck, `false` otherwise.
   */
  constructor (options) {
    this.opts = Object.assign({}, {
      resizeWait: 350,
      direction: CSDirection.up
    }, options);

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`); // eslint-disable-line
    }

    let targetRectFn = SSIConst.optionRectFn(this.opts.target);
    if (!targetRectFn) {
      targetRectFn = () => ({});
      console.warn(`failed to identify targetElement with "${this.opts.target}"`); // eslint-disable-line
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn(`failed to identify moving element with "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    this.viewportHeight = window.innerHeight;

    this.notify = this.opts.notify ?
      setTimeout.bind(null, this.opts.notify, 0) : () => false;

    switch (this.opts.direction) {
      case CSDirection.right:
        this.intersectFrom = SSIConst.left;
        this.transform = boundY => `translateX(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(targetRectFn().left -
            this.movingElement.getBoundingClientRect().right);
        break;
      case CSDirection.left:
        this.intersectFrom = SSIConst.right;
        this.transform = boundY => `translateX(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().left -
            targetRectFn().right);
        break;
      case CSDirection.down:
        this.intersectFrom = SSIConst.top;
        this.transform = boundY => `translateY(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(targetRectFn().top -
            this.movingElement.getBoundingClientRect().bottom);
        break;
      default:
      case CSDirection.up:
        this.intersectFrom = SSIConst.bottom;
        this.transform = boundY => `translateY(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().top -
            targetRectFn().bottom);
        break;
    }

    if (typeof this.opts.traverseLength === 'function') {
      this.traverseLength = this.opts.traverseLength;
    }

    this.uBound = this.traverseLength();

    if (Number.isNaN(this.uBound)) {
      console.warn('traverseLength must return a number'); // eslint-disable-line
    }

    if (typeof this.opts.transform === 'function') {
      this.transform = this.opts.transform;
    }

    this.tickScroll = false;
    this.tickResize = false;

    this.saveY = 0;
    this.animate = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
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
   */
  updateResize (y) {
    this.movingElement.style.transform = this.transform(0);
    /* eslint-disable no-unused-expressions */
    /* This forces any incidental changes to take hold right now */
    window.getComputedStyle(this.movingElement).transform;
    /* eslint-enable no-unused-expressions */
    this.uBound = this.traverseLength();

    /* Update saveY to preserve the intention of the behavior on smaller screens */
    const newSaveY = this.saveY * (window.innerHeight / this.viewportHeight);
    this.viewportHeight = window.innerHeight;
    if (newSaveY < this.saveY) {
      this.saveY = newSaveY;
    }

    this.movingElement.style.transform =
      this.transform(Math.min(y, this.uBound));
  }

  /**
   * Does the work of the scroll event.
   * Move the moving element until someone calls 'stick'.
   * Once stuck, looks to unstick it self when it re-crosses the stuck position.
   */
  updateScroll (y) {
    if (this.animate) {
      this.saveY = y;
      this.movingElement.style.transform =
        this.transform(Math.min(y, this.uBound));
    } else {
      this.animate = this.saveY >= y;
      if (this.animate) {
        this.notify(false);
      }
    }
  }

  /**
   * Stops the animation, emulating sticky behavior.
   */
  stick () {
    this.animate = false;
    this.notify(true);
  }

  /**
   * Start the custom sticky behavior.
   */
  start () {
    window.addEventListener('resize', this.onResize, {
      passive: true
    });
    this.scrollSource.addEventListener('scroll', this.onScroll, {
      passive: true
    });
  }

  /**
   * Stop the custom sticky behavior.
   */
  stop () {
    window.removeEventListener('resize', this.onResize);
    this.scrollSource.removeEventListener('scroll', this.onScroll);
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
 * @param {Function} [options.onStick] - Called when the moving element sticks or becomes unstuck.
 * Callback receives boolean `true` for stuck, `false` otherwise.
 */
export function createCustomSticky (options = {}) {
  const customSticky = new CustomSticky(options);
  const ssi = createSimpleScrollIntersection(Object.assign(options, {
    notify: (result) => {
      if (result.intersection && result.from[customSticky.intersectFrom]) {
        customSticky.stick();
      }
    }
  }));
  let startedWithPeers = false;

  return {
    getUpdateResize: () => customSticky.updateResize.bind(customSticky),
    getUpdateScroll: () => customSticky.updateScroll.bind(customSticky),
    getSsiUpdateScroll: () => ssi.getUpdateScroll.bind(ssi),
    /**
     * @param {Array} [peers] - Collection of CustomSticky objects listening on
     * the same scroll source that should be started with this CustomSticky and
     * serviced in one RAF.
     */
    start: (peers) => {
      startedWithPeers = Array.isArray(peers) && peers.length > 0;

      if (startedWithPeers) {
        const selfUpdateScroll = customSticky.updateScroll.bind(customSticky);
        const selfSsiUpdateScroll = ssi.getUpdateScroll();
        const peerUpdateScrolls = peers.map(peer => peer.getUpdateScroll());
        const peerSsiUpdateScrolls = peers.map(peer => peer.getSsiUpdateScroll());

        customSticky.updateScroll = (y) => {
          selfSsiUpdateScroll();
          peerSsiUpdateScrolls.forEach(update => update());
          selfUpdateScroll(y);
          peerUpdateScrolls.forEach(update => update(y));
        };

        const selfUpdateResize = customSticky.updateResize.bind(customSticky);
        const peerUpdateResizes = peers.map(peer => peer.getUpdateResize());

        customSticky.updateResize = (y) => {
          selfUpdateResize(y);
          peerUpdateResizes.forEach(update => update(y));
        };
      } else {
        ssi.start();
      }

      customSticky.start();
    },
    stop: () => {
      customSticky.stop();
      if (!startedWithPeers) {
        ssi.stop();
      }
    }
  };
}

export default createCustomSticky;
