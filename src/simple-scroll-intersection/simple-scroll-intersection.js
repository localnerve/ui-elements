/**
 * Simple Scroll Intersection behavior.
 * Use when you have a simple situation/animation where IntersectionObserver
 * doesn't make sense.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document */

/* eslint-disable import/no-unresolved */
import { createPassiveEventHandlerOption } from '../utils/passiveEvent';
/* eslint-enable import/no-unresolved */

export class SSIConst {
  static get top () {
    return 'top';
  }
  static get bottom () {
    return 'bottom';
  }
  static get left () {
    return 'left';
  }
  static get right () {
    return 'right';
  }
}

class SimpleScrollIntersection {
  /**
   * Constructor for SimpleScrollIntersection
   * Detects when a moving element intersects a target element on scroll.
   *
   * @param {Object} options - SimpleScrollIntersection options.
   * @param {String} options.scrollSelector - Identifies the scroll event source.
   * @param {String} options.movingSelector - Identifies the moving element
   * to test against.
   * @param {String|Function} options.target - String identifies the target element
   * to test intersection on, or function that returns a Rect to test intersection against.
   * @param {Function} options.notify - Call when intersect or dis-intersect.
   * Receives object containing intersection bool and "from" booleans.
   */
  constructor (options) {
    const noop = () => null;
    const badEl = {
      getBoundingClientRect: noop
    };

    this.opts = Object.assign({}, {
      notify: noop,
    }, options);

    this.notify = setTimeout.bind(null, this.opts.notify, 0);
    if (this.opts.notify === noop) {
      console.warn('notify option must be supplied to get results'); // eslint-disable-line
    }

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn(`failed to identify a scroll source with "${this.opts.scrollSelector}"`); // eslint-disable-line
    }

    this.targetRectFn = SimpleScrollIntersection.optionRectFn(this.opts.target);
    if (!this.targetRectFn) {
      console.warn(`failed to compute target rect on "${this.opts.target}"`); // eslint-disable-line
    }

    this.moving = document.querySelector(this.opts.movingSelector) || badEl;
    if (!this.moving.getBoundingClientRect()) {
      console.warn(`failed to compute moving rect on "${this.opts.movingSelector}"`); // eslint-disable-line
    }

    this.tickScroll = false;
    this.intersected = this.computeIntersection().intersection;

    this.onScroll = this.onScroll.bind(this);

    this.passiveEventOption = createPassiveEventHandlerOption();
  }

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
   * Computes intersection of moving vs target Rects.
   * Moving rect is recalculated here.
   *
   * @returns {Object} intersection boolean and direction booleans.
   */
  computeIntersection () {
    const from = {};
    const rect1 = this.targetRectFn();
    const rect2 = this.moving.getBoundingClientRect();

    if (!rect2 || !rect1) {
      return { intersection: false, from };
    }

    const top = Math.max(rect1.top, rect2.top);
    const bottom = Math.min(rect1.bottom, rect2.bottom);
    const left = Math.max(rect1.left, rect2.left);
    const right = Math.min(rect1.right, rect2.right);
    const width = right - left;
    const height = bottom - top;


    const intersection = (width >= 0 && height >= 0);

    from[SSIConst.top] = rect2.bottom >= rect1.top && rect2.top < rect1.top;
    from[SSIConst.bottom] = rect2.top <= rect1.bottom && rect2.bottom > rect1.bottom;
    from[SSIConst.left] = rect2.right >= rect1.left && rect2.left < rect1.left;
    from[SSIConst.right] = rect2.left <= rect1.right && rect2.right > rect1.right;

    return { intersection, from };
  }

  /**
   * Throttling scroll event handler.
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
   * Compute intersection and send notification.
   */
  updateScroll () {
    const result = this.computeIntersection();

    if (this.intersected && !result.intersection) {
      this.intersected = false;
      this.notify(result);
    } else if (!this.intersected && result.intersection) {
      this.intersected = true;
      this.notify(result);
    }
  }

  start () {
    this.scrollSource.addEventListener(
      'scroll',
      this.onScroll,
      this.passiveEventOption
    );
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
    getUpdateScroll: () => ssi.updateScroll.bind(ssi),
    start: ssi.start.bind(ssi),
    stop: ssi.stop.bind(ssi)
  };
}

export default createSimpleScrollIntersection;
