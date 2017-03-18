/**
 * Simple Scroll Intersection behavior.
 * Use when you have a simple situation/animation where IntersectionObserver
 * doesn't make sense.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */

class SimpleScrollIntersection {
  /**
   * Constructor for SimpleScrollIntersection
   * Detects when a moving element intersects a stationary element on scroll.
   *
   * @param {Object} options - SimpleScrollIntersection options.
   * @param {String} options.scrollSelector - Identifies the scroll event source.
   * @param {String} options.stationarySelector - Identifies the stationary element
   * to test intersection on.
   * @param {String} options.movingSelector - Identifies the moving element
   * to test against.
   * @param {Function} options.notify - Call when intersect or dis-intersect.
   * Receives object containing intersection bool and "from" booleans.
   */
  constructor (options) {
    const noop = () => {};
    const emptyRect = {
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
    const badEl = {
      getBoundingClientRect: () => null
    };

    this.opts = Object.assign({}, {
      notify: noop,
    }, options);

    this.notify = setTimeout.bind(null, this.opts.notify, 0);
    if (this.notify === noop) {
      console.warn('notify option must be supplied to get results'); // eslint-disable-line
    }

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`); // eslint-disable-line
    }

    const stationary = document.querySelector(this.opts.stationarySelector) || badEl;
    this.stationaryRect = stationary.getBoundingClientRect() || emptyRect;
    if (this.stationaryRect === emptyRect) {
      console.warn(`failed to compute stationary rect on "${this.opts.stationarySelector}"`); // eslint-disable-line
    }

    this.moving = document.querySelector(this.opts.movingSelector) || badEl;
    if (!this.moving.getBoundingClientRect()) {
      console.warn(`failed to compute moving rect on "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    this.tickScroll = false;
    this.intersected = this.computeIntersection().intersection;

    this.onScroll = this.onScroll.bind(this);
  }

  /**
   * Computes intersection of moving vs stationary rects.
   * Moving rect is recalculated here.
   *
   * @returns {Object} intersection boolean and direction booleans.
   */
  computeIntersection () {
    const from = { top: false, bottom: false, left: false, right: false };
    const rect1 = this.stationaryRect;
    const rect2 = this.moving.getBoundingClientRect();

    if (!rect2) {
      return { intersection: false, from };
    }

    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.bottom);
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.right);
    const width = right - left;
    const height = bottom - top;


    const intersection = (width >= 0 && height >= 0);

    from.top = rect2.bottom >= rect1.top && rect2.top < rect1.top;
    from.bottom = rect2.top <= rect1.bottom && rect2.bottom > rect1.bottom;
    from.left = rect2.right >= rect1.left && rect2.left < rect1.left;
    from.right = rect2.left <= rect1.right && rect2.right > rect1.right;

    return { intersection, from };
  }

  /**
   * Throttling scroll event handler.
   */
  onScroll () {
    if (!this.tickScroll) {
      this.tickScroll = true;
      window.requestAnimationFrame(() => {
        const result = this.computeIntersection();

        if (this.intersected && !result.intersection) {
          this.intersected = false;
          this.notify(result);
        } else if (!this.intersected && result.intersection) {
          this.intersected = true;
          this.notify(result);
        }

        this.tickScroll = false;
      });
    }
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
 * Creates the public interface for a SimpleScrollIntersection instance.
 * @see SimpleScrollIntersection constructor for options.
 */
export function createSimpleScrollIntersection (options) {
  const ssi = new SimpleScrollIntersection(options);
  return {
    start: ssi.start.bind(ssi),
    stop: ssi.stop.bind(ssi)
  };
}

export default createSimpleScrollIntersection;
