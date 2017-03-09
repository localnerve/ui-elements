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
   * @param {Array} options.props - The properties to animate for vertical collapse.
   * Can also include opacity.
   * @param {Function} [options.notify] - Called when collapse starts and when it reverses.
   * @param {Number} [options.resizeWait] - Millis to wait before handling a resize
   * update. Disregards more resize events during this time. Defaults to 350.
   */
  constructor (options) {
    this._opts = Object.assign({}, {
      resizeWait: 350,
      props: [
        'opacity',
        'height',
        'marginTop',
        'marginBottom',
        'paddingTop',
        'paddingBottom',
        'borderTopWidth',
        'borderBottomWidth'
      ],
      notify: () => {}
    }, options);

    this._scrollSource = document.querySelector(options.scrollSelector);
    this._top = {
      el: document.querySelector(options.topCollapseSelector),
      height: 0
    };
    this._bot = {
      el: document.querySelector(options.bottomCollapseSelector)
    };
    this._props = this._opts.props;

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
   * Make the css-style prop name (dash) for the given camel-cased property name.
   * For each capital letter found, replace with -(lowercase).
   *
   * @param {Array} prop - camel-cased property name.
   */
  static toStyleHyphen (prop) {
    return prop.replace(/[A-Z]/g,
      (match, offset) => (offset ? '-' : '') + match.toLowerCase());
  }

  /**
   * Calculate new property values from the difference of a property in q
   * by cross-multiplying against current change of Y in domainY (ratio).
   * Apply a property-specific gain if one is supplied.
   *
   * @param {Object} q - The container of saved property values.
   * @param {Number} ratio - Y/domainY, the percentage changed.
   * @param {Object} gains - A container of property-specific gains to apply.
   * @param {Array} props - The properties in q to calculate against.
   */
  static calcValues (q, ratio, gains, ...props) {
    const values = {};

    props.forEach((prop) => {
      const gain = gains[prop] || 1.0;
      values[prop] = (q[prop] - (q[prop] * ratio)).toFixed(2) * gain;
    });

    return values;
  }

  /**
   * Update the given element for a collapse animation (down or up).
   *
   * @param {Object} target - An object containing the live element (el) and saved dimensions.
   * @param {Object} target.el - An HTMLElement object with a style prop.
   * @param {Object} target.el.style - A CSSStyleDeclaration for the element.
   * @param {Number} changeY - The last recorded value of Y divided by domain of Y.
   * @param {Boolean} isUp - True if the scroll is traveling up.
   * @param {Array} props - The style properties to change.
   * @returns {Boolean} true if the target was updated.
   */
  static collapse (target, changeY, isUp, props) {
    let updated = false;
    const acc = isUp ? 1.6 : (1 / 1.6); // 60% de/acceleration
    const style = target.el.style;

    if (style.height !== '0px' || isUp) {
      const values =
        ScrollCollapse.calcValues(target, changeY, {
          opacity: acc
        }, ...props);

      if (props.includes('opacity')) {
        style.opacity = values.opacity < 0.15 ? 0 : Math.min(values.opacity, 1.0);
      }

      props.forEach((prop) => {
        if (prop === 'opacity') return;
        style[prop] = `${values[prop] < 1 ? 0 : values[prop]}px`;
      });

      updated = values.height > 0;
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
    const topClientHeight = this._top.el.getBoundingClientRect().height;

    // ignore if resize during collapse.
    if (topClientHeight < this._top.height) {
      return;
    }

    const topStyle = window.getComputedStyle(this._top.el);
    this._top.height = topClientHeight;
    this._props.forEach((prop) => {
      if (prop === 'height') return;
      this._top[prop] = ScrollCollapse.getStyleNumber(
        topStyle, ScrollCollapse.toStyleHyphen(prop)
      );
    });

    const botStyle = window.getComputedStyle(this._bot.el);
    this._bot.height = this._bot.el.getBoundingClientRect().height;
    this._props.forEach((prop) => {
      if (prop === 'height') return;
      this._bot[prop] = ScrollCollapse.getStyleNumber(
        botStyle, ScrollCollapse.toStyleHyphen(prop)
      );
    });

    const scrollClientHeight = this._scrollSource.getBoundingClientRect().height;
    const overflowHeight = this._scrollSource.scrollHeight - scrollClientHeight;
    const topHeight = this._props.reduce((acc, prop) => {
      if (prop === 'opacity') return acc;
      return acc + this._top[prop];
    }, 0);
    const botHeight = this._props.reduce((acc, prop) => {
      if (prop === 'opacity') return acc;
      return acc + this._bot[prop];
    }, 0);

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

      this._scrollSource.style.willChange = 'scroll-position';
      this._top.el.style.willChange =
        this._props.map(prop => ScrollCollapse.toStyleHyphen(prop)).join(',');
      this._bot.el.style.willChange =
        this._props.map(prop => ScrollCollapse.toStyleHyphen(prop)).join(',');

      if (this._lastY > 0) {
        // Restore the previous scroll
        this._onScroll();
      }
    } else {
      this._scrollSource.style.willChange = 'auto';
      this._top.el.style.willChange = 'auto';
      this._bot.el.style.willChange = 'auto';
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
      this._top, this._lastY / this._scrollSrcHeight, isUp, this._props
    );
    ScrollCollapse.collapse(
      this._bot, this._lastY / this._scrollSrcHeight, isUp, this._props
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
