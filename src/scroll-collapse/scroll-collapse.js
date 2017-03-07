/**
 * scroll-collapse
 *
 * A small, no-dep scroll handler that collapses two regions in relation to the scroll.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint no-underscore-dangle:0 */
/* global window, document */

/**
 * ScrollCollapse Constants
 */
export class SCConstants {
  static get START_COLLAPSE () {
    return 'start_collapse';
  }
  static get END_COLLAPSE () {
    return 'end_collapse';
  }
  static get START_EXPAND () {
    return 'start_expand';
  }
}

class ScrollCollapse {
  /**
   * ScrollCollapse constructor
   * @public
   *
   * @param {Object} options - ScrollCollapse constructor.
   * @param {String} options.scrollSelector - The scroll source class.
   * @param {String} options.topCollapseSelector - The selector identifying the top
   * area to collapse.
   * @param {String} options.bottomCollapseSelector - The selector identifying the
   * bottom area to collapse.
   * @param {Function} [options.notify] - Called when collapse starts and when it reverses.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 350.
   */
  constructor (options) {
    this._opts = Object.assign({}, {
      resizeWait: 350,
      notify: () => {}
    }, options);

    this._scrollSource = document.querySelector(options.scrollSelector);
    this._top = {
      el: document.querySelector(options.topCollapseSelector)
    };
    this._bot = {
      el: document.querySelector(options.bottomCollapseSelector)
    };

    this._lastY = 0;
    this._tickScroll = false;
    this._tickResize = false;
    this._collapseStart = false;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);

    window.addEventListener('resize', this._onResize, {
      passive: true
    });
  }

  /**
   * Pull the numeric part of a string and parse as float.
   *
   * @param {String} input - The string to parse as float.
   * @returns {Number} The parsed float.
   */
  static getNumber (input) {
    const reNotNum = /[^.+\-\d]+/;
    return parseFloat(input.replace(reNotNum, ''));
  }

  /**
   * Get the numeric value of one or more style props. Adds multiple props together.
   *
   * @param {Object} style - A CSSStyleDeclaration object.
   * @param {Array} props - One or more property names.
   * @returns {Number} The sum of all the float values of the props.
   */
  static getStyleNumber (style, ...props) {
    let total = 0;

    props.forEach((prop) => {
      total += ScrollCollapse.getNumber(style.getPropertyValue(prop) || '0');
    });

    return total;
  }

  /**
   * Update the given element for a collapse animation (down or up).
   *
   * @param {Object} target - An object containing the live element and saved dimensions.
   * @param {Object} target.el - An HTMLElement object. Updated with the new values.
   * @param {Number} target.height - The saved height dimension for the element.
   * @param {Number} target.marginBottom - The saved marginBottom dimension for the element.
   * @param {Number} target.marginTop - The saved marginTop dimension for the element.
   * @param {Number} target.opacity - The saved opacity for the element.
   * @param {Number} lastY - The last recorded value of Y.
   * @param {Number} domainY - The domain of Y.
   * @param {Boolean} isUp - True if the scroll is traveling up.
   * @returns {Boolean} true if the target was updated.
   */
  static collapse (target, lastY, domainY, isUp) {
    let updated = false;
    const acc = isUp ? 1.5 : (1 / 1.5); // 50% acceleration
    const style = target.el.style;

    if (style.height !== '0px' || isUp) {
      const newHeight = (target.height - ((lastY * target.height) / domainY))
        .toFixed(2);

      const newMarginBot = (target.marginBottom - ((lastY * target.marginBottom) / domainY))
        .toFixed(2);

      const newMarginTop = (target.marginTop - ((lastY * target.marginTop) / domainY))
        .toFixed(2);

      const newOpacity = Math.min(
        (target.opacity - ((lastY * target.opacity) / domainY)).toFixed(2) * acc,
        1.0);

      style.opacity = newOpacity < 0.15 ? 0 : newOpacity;
      style.marginTop = `${newMarginTop < 1 ? 0 : newMarginTop}px`;
      style.marginBottom = `${newMarginBot < 1 ? 0 : newMarginBot}px`;
      style.height = `${newHeight < 1 ? 0 : newHeight}px`;

      updated = newHeight > 0;
    }

    return updated;
  }

  /**
   * resize event handler.
   * debounce and wait to schedule animation frame.
   * @private
   */
  _onResize () {
    if (!this._tickResize) {
      this._tickResize = true;
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          this._updateSize();
          this._tickResize = false;
        });
      }, this._opts.resizeWait);
    }
  }

  /**
   * scroll event handler.
   * debounce and schedule animation frame.
   * @private
   */
  _onScroll () {
    const scrollY = this._scrollSource.scrollTop;
    const isUp = scrollY < this._lastY;
    const isZero = this._lastY === 0;

    this._lastY = scrollY;

    if (!this._tickScroll) {
      this._tickScroll = true;
      window.requestAnimationFrame(() => {
        this._updateScroll(isZero, isUp);
        this._tickScroll = false;
      });
    }
  }

  /**
   * Recalculate key dimensions for the resize event.
   * @private
   */
  _updateSize () {
    const topSavedHeight = this._top.el.getBoundingClientRect().height;

    // ignore if resize during collapse.
    if (!topSavedHeight) {
      return;
    }

    const topStyle = window.getComputedStyle(this._top.el);
    this._top.height = topSavedHeight;
    this._top.marginBottom = ScrollCollapse.getStyleNumber(topStyle, 'margin-bottom');
    this._top.marginTop = ScrollCollapse.getStyleNumber(topStyle, 'margin-top');
    this._top.opacity = ScrollCollapse.getStyleNumber(topStyle, 'opacity');

    const botStyle = window.getComputedStyle(this._bot.el);
    this._bot.height = this._bot.el.getBoundingClientRect().height;
    this._bot.marginBottom = ScrollCollapse.getStyleNumber(botStyle, 'margin-bottom');
    this._bot.marginTop = ScrollCollapse.getStyleNumber(botStyle, 'margin-top');
    this._bot.opacity = ScrollCollapse.getStyleNumber(botStyle, 'opacity');

    const scrollClientHeight = this._scrollSource.getBoundingClientRect().height;
    const overflowHeight = this._scrollSource.scrollHeight - scrollClientHeight;
    const topHeight = this._top.height + this._top.marginTop + this._top.marginBottom;
    const botHeight = this._bot.height + this._bot.marginTop + this._bot.marginBottom;

    if (overflowHeight <= scrollClientHeight + topHeight + botHeight) {
      this._scrollSrcHeight = overflowHeight - topHeight - botHeight;
    } else {
      this._scrollSrcHeight = scrollClientHeight;
    }

    // If there is no meaningful scroll "travel" after resize, then stop the behavior.
    this._scrollSource.removeEventListener('scroll', this._onScroll);
    if (this._scrollSrcHeight > 0) {
      this._scrollSource.addEventListener('scroll', this._onScroll, {
        passive: true
      });
      if (this._lastY > 0) {
        // Restore the previous scroll
        this._onScroll();
      }
    }
  }

  /**
   * Perform the scroll collapses.
   * @private
   *
   * @param {Boolean} isZero - True if scrolling from Y of zero.
   * @param {Boolean} isUp - True if scrolling up.
   */
  _updateScroll (isZero, isUp) {
    const updated =
    ScrollCollapse.collapse(
      this._top, this._lastY,
      this._scrollSrcHeight, isUp
    );
    ScrollCollapse.collapse(
      this._bot, this._lastY,
      this._scrollSrcHeight, isUp
    );

    if (isZero) {
      setTimeout(this._opts.notify, 0, SCConstants.START_COLLAPSE);
      this._collapseStart = true;
    } else if (!updated && this._collapseStart) {
      setTimeout(this._opts.notify, 0, SCConstants.END_COLLAPSE);
      this._collapseStart = false;
    } else if (!this._collapseStart && isUp && updated) {
      setTimeout(this._opts.notify, 0, SCConstants.START_EXPAND);
      this._collapseStart = true;
    }
  }

  /**
   * Start the behavior
   * @public
   */
  start () {
    this._updateSize();
  }
}

/**
 * Start the ScrollCollapse behavior.
 *
 * @param {Object} options - ScrollCollapse options.
 * @see ScrollCollapse constructor.
 */
export function startScrollCollapse (options) {
  const scrollCollapse = new ScrollCollapse(options);
  scrollCollapse.start();
}

export { startScrollCollapse as default };
