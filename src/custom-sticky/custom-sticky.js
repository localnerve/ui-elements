/**
 * Custom Sticky behavior.
 *
 * Sticks a moving element driven by scroll to a stationary element.
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
   * @param {String|Function} options.stationary - A selector that uniquely identifies
   * the non-moving element to stick to, or a function that returns a Rect that represents
   * the stationary move target.
   * @param {Function} [options.traverseLength] - Retrieves the distance to
   * traverse over before sticking. Defaults to directional distance between stationary
   * and moving element rects.
   * @param {String} [options.direction] - The direction the moving element should move.
   * 'up', 'down', 'left', or 'right', defaults to 'up'.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 350.
   * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
   * Defaults to the appropriate translation for the direction.
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

    let stationaryRectFn = SSIConst.optionRectFn(this.opts.stationary);
    if (!stationaryRectFn) {
      stationaryRectFn = () => ({});
      console.warn(`failed to identify stationaryElement with "${this.opts.stationary}"`); // eslint-disable-line
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn(`failed to identify moving element with "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    switch (this.opts.direction) {
      case CSDirection.right:
        this.intersectFrom = SSIConst.left;
        this.transform = boundY => `translateX(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(stationaryRectFn().left -
            this.movingElement.getBoundingClientRect().right);
        break;
      case CSDirection.left:
        this.intersectFrom = SSIConst.right;
        this.transform = boundY => `translateX(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().left -
            stationaryRectFn().right);
        break;
      case CSDirection.down:
        this.intersectFrom = SSIConst.top;
        this.transform = boundY => `translateY(${boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(stationaryRectFn().top -
            this.movingElement.getBoundingClientRect().bottom);
        break;
      default:
      case CSDirection.up:
        this.intersectFrom = SSIConst.bottom;
        this.transform = boundY => `translateY(${-boundY}px)`;
        this.traverseLength = () =>
          Math.ceil(this.movingElement.getBoundingClientRect().top -
            stationaryRectFn().bottom);
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
          this.updateResize();
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
        this.updateScroll();
        this.tickScroll = false;
      });
    }
  }

  /**
   * Does the work of the resize event.
   * Update the upper bound.
   * Stay stuck if stuck.
   */
  updateResize () {
    this.movingElement.style.transform = this.transform(0);
    /* eslint-disable no-unused-expressions */
    window.getComputedStyle(this.movingElement).transform;
    /* eslint-enable no-unused-expressions */
    this.uBound = this.traverseLength();

    this.animate = true;
    this.updateScroll();
  }

  /**
   * Does the work of the scroll event.
   * Move the moving element until someone calls 'stick'.
   * Once stuck, looks to unstick it self when it re-crosses the stuck position.
   */
  updateScroll () {
    const y = this.scrollSource.scrollTop;

    if (this.animate) {
      this.saveY = y;
      this.movingElement.style.transform =
        this.transform(Math.min(y, this.uBound));
    } else {
      this.animate = this.saveY >= y;
    }
  }

  /**
   * Stops the animation, emulating sticky behavior.
   */
  stick () {
    this.animate = false;
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
 * @param {String|Function} options.stationary - A selector that uniquely identifies
 * the non-moving element to stick to, or a function that returns a Rect that represents
 * the stationary move target.
 * @param {Function} [options.traverseLength] - Gets the distance to travel before sticking.
 * Defaults to the distance between stationary and moving element rects.
 * @param {String} [options.direction] - 'up', 'down', 'left', or 'right'.
 * The general direction the moving element should move. Defaults to 'up'.
 * @param {Number} [options.resizeWait] - Milliseconds to wait before recalculating on resize event.
 * (Throttles the resize event). Defaults to 350.
 * @param {Function} [options.transform] - Returns a custom transform given a scroll position.
 * Defaults to the appropriate translation for the direction.
 */
export function createCustomSticky (options = {}) {
  const customSticky = new CustomSticky(options);
  const ssi = createSimpleScrollIntersection(Object.assign(options, {
    notify: (result) => {
      if (result.intersected && result.from[customSticky.intersectFrom]) {
        customSticky.stick();
      }
    }
  }));

  return {
    start: () => {
      ssi.start();
      customSticky.start();
    },
    stop: () => {
      customSticky.stop();
      ssi.stop();
    }
  };
}

export default createCustomSticky;
