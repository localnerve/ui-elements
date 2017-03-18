/**
 * Custom Sticky behavior.
 *
 * For now, always sticks a moving element moving up to a stationary element,
 * but that is very changable.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global document, window */
/* eslint-disable import/no-unresolved */
import { createSimpleScrollIntersection } from './simple-scroll-intersection';

class CustomSticky {
  /**
   * @param {Object} options - CustomSticky options.
   * @param {String} options.scrollSelector - Identifies the scroll source.
   * @param {String} options.movingSelector - Identifies the moving element to stick.
   * @param {String|Function} options.traverse - Selector to Identify the element to traverse
   * over before stick, or a function to get the height of the area to traverse over.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 350.
   */
  constructor (options) {
    const badEl = {
      getBoundingClientRect: () => null
    };

    this.opts = Object.assign({}, {
      resizeWait: 350
    }, options);

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`); // eslint-disable-line
    }

    if (typeof this.opts.traverse === 'string') {
      const traverseElement = document.querySelector(this.opts.traverse) || badEl;
      if (traverseElement === badEl) {
        console.warn(`failed to get traverse element from "${this.opts.traverse}"`); // eslint-disable-line
      }
      this.traverseHeight = () =>
        Math.ceil(traverseElement.getBoundingClientRect().height);
      this.topBound = this.traverseHeight();
    } else if (typeof this.opts.traverse === 'function') {
      this.traverseHeight = this.opts.traverse;
      this.topBound = this.traverseHeight();
    } else {
      console.warn('bad argument supplied for CustomSticky.traverse option'); // eslint-disable-line
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn(`failed to identify moving element with "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    this.tickScroll = false;
    this.tickResize = false;

    this.saveY = 0;
    this.animate = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener('resize', this.onResize, {
      passive: true
    });
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
          this.topBound = this.traverseHeight();
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
   * Does the work of the scroll event.
   * Move the moving element until someone calls 'stick'.
   * Once stuck, looks to unstick it self when it re-crosses the stuck position.
   * For now, just bottom to top supported.
   */
  updateScroll () {
    const y = this.scrollSource.scrollTop;

    if (this.animate) {
      const transY = Math.min(y, this.topBound);

      this.saveY = y;
      this.movingElement.style.transform = `translateY(${-transY}px)`;
    } else {
      this.animate = this.saveY >= y;
    }
  }

  stick () {
    this.animate = false;
  }

  start () {
    this.scrollSource.addEventListener('scroll', this.onScroll, {
      passive: true
    });
  }

  stop () {
    this.scrollSource.removeEventListener('scroll', this.onScroll);
  }
}

/**
 * Create public interface to custom sticky behavior.
 *
 * @param {Object} options - customSticky options.
 * @param {String} options.scrollSelector - Identifies the scroll source element.
 * @param {String} options.stationarySelector - Identifies the non-moving element to stick to.
 * @param {String} options.movingSelector - Identifies the moving element that sticks.
 * @param {String|Function} options.traverse - Identifies the element to scroll over
 * before sticking, or a function that returns the height of the area to traverse before sticking.
 * @param {Number} [options.resizeWait] - Milliseconds to wait before recalculating on resize event.
 * (Throttles the resize event). Defaults to 350.
 */
export function createCustomSticky (options = {}) {
  const customSticky = new CustomSticky(options);
  const ssi = createSimpleScrollIntersection(Object.assign(options, {
    notify: (result) => {
      if (result.intersected && result.from.bottom) {
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
