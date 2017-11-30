/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _scrollCollapse = __webpack_require__(1);

document.addEventListener('DOMContentLoaded', function () {
  (0, _scrollCollapse.startScrollCollapse)({
    topCollapseSelector: '.logo',
    bottomCollapseSelector: '.collapsible-footer',
    scrollSelector: '.text-container',
    props: ['opacity', 'height', 'marginTop', 'marginBottom'],
    notify: function notify(event) {
      switch (event) {
        case _scrollCollapse.SCConstants.START_COLLAPSE:
          console.log('@@@ collapse starting'); // eslint-disable-line
          break;
        case _scrollCollapse.SCConstants.END_COLLAPSE:
          console.log('@@@ collapse ended'); // eslint-disable-line
          break;
        case _scrollCollapse.SCConstants.START_EXPAND:
          console.log('@@@ expand starting'); // eslint-disable-line
          break;
        case _scrollCollapse.SCConstants.END_EXPAND:
          console.log('@@@ expand ended'); // eslint-disable-line
          break;
        default:
          console.log('@@@ unknown event'); // eslint-disable-line
          break;
      }
    }
  });
}, {
  once: true
}); /**
     * Entry point to scroll-collapse example.
     *
     * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
     * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
     */
/* global document */
/* eslint-disable import/no-unresolved */

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SCConstants = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * scroll-collapse
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A small, no-dep scroll handler that collapses two regions in relation to the scroll.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
/* eslint no-underscore-dangle:0 */
/* global window, document, setTimeout, setInterval, clearInterval */

/* eslint import/no-unresolved:0 */


exports.startScrollCollapse = startScrollCollapse;

var _passiveEvent = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ScrollCollapse Constants
 */
var SCConstants = exports.SCConstants = function () {
  function SCConstants() {
    _classCallCheck(this, SCConstants);
  }

  _createClass(SCConstants, null, [{
    key: 'START_COLLAPSE',
    get: function get() {
      return 'start_collapse';
    }
  }, {
    key: 'END_COLLAPSE',
    get: function get() {
      return 'end_collapse';
    }
  }, {
    key: 'START_EXPAND',
    get: function get() {
      return 'start_expand';
    }
  }, {
    key: 'END_EXPAND',
    get: function get() {
      return 'end_expand';
    }
  }]);

  return SCConstants;
}();

var ScrollCollapse = function () {
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
  function ScrollCollapse(options) {
    _classCallCheck(this, ScrollCollapse);

    var noop = function noop() {};

    this._opts = Object.assign({}, {
      resizeWait: 350,
      props: ['opacity', 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'],
      notify: noop
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
    this._notify = this._opts.notify === noop ? noop : setTimeout.bind(null, this._opts.notify, 0);

    this._lastY = 0;
    this._tickScroll = false;
    this._tickResize = false;
    this._collapseStart = false;
    this._endExpandInterval = undefined;

    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this._endExpand = this._endExpand.bind(this);

    this._passiveEventOption = (0, _passiveEvent.createPassiveEventHandlerOption)();

    window.addEventListener('resize', this._onResize, this._passiveEventOption);
  }

  /**
   * Pull the numeric part of a string and parse as float.
   *
   * @param {String} input - The string to parse as float.
   * @returns {Number} The parsed float.
   */


  _createClass(ScrollCollapse, [{
    key: '_onResize',


    /**
     * resize event handler.
     * debounce and wait to schedule animation frame.
     * @private
     */
    value: function _onResize() {
      var _this = this;

      if (!this._tickResize) {
        this._tickResize = true;
        setTimeout(function () {
          window.requestAnimationFrame(function () {
            _this._updateSize();
            _this._tickResize = false;
          });
        }, this._opts.resizeWait);
      }
    }

    /**
     * scroll event handler.
     * debounce and schedule animation frame.
     * @private
     */

  }, {
    key: '_onScroll',
    value: function _onScroll() {
      var _this2 = this;

      var scrollY = this._scrollSource.scrollTop;
      var isUp = scrollY < this._lastY;
      var isZero = this._lastY === 0;

      this._lastY = scrollY;

      if (!this._tickScroll) {
        this._tickScroll = true;
        window.requestAnimationFrame(function () {
          _this2._updateScroll(isZero, isUp);
          _this2._tickScroll = false;
        });
      }
    }

    /**
     * Recalculate key dimensions for the resize event.
     * @private
     */

  }, {
    key: '_updateSize',
    value: function _updateSize() {
      var _this3 = this;

      var topClientHeight = this._top.el.getBoundingClientRect().height;

      // ignore if resize during collapse.
      if (topClientHeight < this._top.height) {
        return;
      }

      var topStyle = window.getComputedStyle(this._top.el);
      this._top.height = topClientHeight;
      this._props.forEach(function (prop) {
        if (prop === 'height') return;
        _this3._top[prop] = ScrollCollapse.getStyleNumber(topStyle, ScrollCollapse.toStyleHyphen(prop));
      });

      var botStyle = window.getComputedStyle(this._bot.el);
      this._bot.height = this._bot.el.getBoundingClientRect().height;
      this._props.forEach(function (prop) {
        if (prop === 'height') return;
        _this3._bot[prop] = ScrollCollapse.getStyleNumber(botStyle, ScrollCollapse.toStyleHyphen(prop));
      });

      var scrollClientHeight = this._scrollSource.getBoundingClientRect().height;
      var overflowHeight = this._scrollSource.scrollHeight - scrollClientHeight;
      var noOverflow = Math.abs(overflowHeight) < 1;
      var topHeight = this._props.reduce(function (acc, prop) {
        if (prop === 'opacity') return acc;
        return acc + _this3._top[prop];
      }, 0);
      var botHeight = this._props.reduce(function (acc, prop) {
        if (prop === 'opacity') return acc;
        return acc + _this3._bot[prop];
      }, 0);

      if (!noOverflow && overflowHeight <= scrollClientHeight + topHeight + botHeight) {
        this._scrollSrcHeight = overflowHeight - topHeight - botHeight;
      } else {
        this._scrollSrcHeight = scrollClientHeight;
      }

      // If there is no meaningful scroll "travel" after resize, then stop the behavior.
      this._scrollSource.removeEventListener('scroll', this._onScroll);
      if (this._scrollSrcHeight > 0) {
        this._scrollSource.addEventListener('scroll', this._onScroll, this._passiveEventOption);

        this._scrollSource.style.willChange = 'scroll-position';
        this._top.el.style.willChange = this._props.map(function (prop) {
          return ScrollCollapse.toStyleHyphen(prop);
        }).join(',');
        this._bot.el.style.willChange = this._props.map(function (prop) {
          return ScrollCollapse.toStyleHyphen(prop);
        }).join(',');

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

  }, {
    key: '_updateScroll',
    value: function _updateScroll(isZero, isUp) {
      var updated = ScrollCollapse.collapse(this._top, this._lastY / this._scrollSrcHeight, isUp, this._props);
      ScrollCollapse.collapse(this._bot, this._lastY / this._scrollSrcHeight, isUp, this._props);

      if (isZero) {
        this._notify(SCConstants.START_COLLAPSE);
        this._collapseStart = true;
        if (this._endExpandInterval) {
          clearInterval(this._endExpandInterval);
          delete this._endExpandInterval;
        }
      } else if (!updated && this._collapseStart) {
        this._notify(SCConstants.END_COLLAPSE);
        this._collapseStart = false;
        if (this._endExpandInterval) {
          clearInterval(this._endExpandInterval);
          delete this._endExpandInterval;
        }
      } else if (!this._collapseStart && isUp && updated) {
        this._notify(SCConstants.START_EXPAND);
        this._collapseStart = true;
        this._endExpandInterval = setInterval(this._endExpand, 200);
      }
    }
  }, {
    key: '_endExpand',
    value: function _endExpand() {
      if (!this._collapseStart) {
        clearInterval(this._endExpandInterval);
        delete this._endExpandInterval;
      } else if (this._scrollSource.scrollTop === 0) {
        this._notify(SCConstants.END_EXPAND);
        clearInterval(this._endExpandInterval);
        delete this._endExpandInterval;
      }
    }

    /**
     * Start the behavior
     * @public
     */

  }, {
    key: 'start',
    value: function start() {
      this._updateSize();
    }
  }], [{
    key: 'getNumber',
    value: function getNumber(input) {
      var reNotNum = /[^.+\-\d]+/;
      return parseFloat(input.replace(reNotNum, ''));
    }

    /**
     * Get the numeric value of one or more style props. Adds multiple props together.
     *
     * @param {Object} style - A CSSStyleDeclaration object.
     * @param {Array} props - One or more property names.
     * @returns {Number} The sum of all the float values of the props.
     */

  }, {
    key: 'getStyleNumber',
    value: function getStyleNumber(style) {
      for (var _len = arguments.length, props = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        props[_key - 1] = arguments[_key];
      }

      return props.reduce(function (acc, prop) {
        return acc + ScrollCollapse.getNumber(style.getPropertyValue(prop) || '0');
      }, 0);
    }

    /**
     * Make the css-style prop name (dash) for the given camel-cased property name.
     * For each capital letter found, replace with -(lowercase).
     *
     * @param {Array} prop - camel-cased property name.
     */

  }, {
    key: 'toStyleHyphen',
    value: function toStyleHyphen(prop) {
      return prop.replace(/[A-Z]/g, function (match, offset) {
        return (offset ? '-' : '') + match.toLowerCase();
      });
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

  }, {
    key: 'collapse',
    value: function collapse(target, changeY, isUp, props) {
      var updated = false;
      var targetStyle = target.el.style;

      if (targetStyle.height !== '0px' || isUp) {
        var values = {};
        var lbounds = {
          opacity: 0.15
        };
        var units = {
          opacity: ' '
        };
        var ubounds = {
          opacity: 1.0
        };
        var easeFns = {
          opacity: function opacity(val) {
            var upFactor = val * 0.5 < 0.15 ? 0 : 1.085;
            return val * (isUp ? upFactor : 0.5);
          }
        };

        props.forEach(function (prop) {
          var easeFn = easeFns[prop] || function (a) {
            return a;
          };
          var lbound = lbounds[prop] || 1.0;
          var val = easeFn(target[prop] - target[prop] * changeY).toFixed(2);
          var ubound = ubounds[prop] || val;
          var unit = units[prop] || 'px';

          values[prop] = val;

          targetStyle[prop] = '' + (val < lbound ? 0 : Math.min(val, ubound)) + unit;
        });

        updated = values.height > 0.5;
      }

      return updated;
    }
  }]);

  return ScrollCollapse;
}();

/**
 * Start the ScrollCollapse behavior.
 *
 * @param {Object} options - ScrollCollapse options.
 * @see ScrollCollapse constructor.
 */


function startScrollCollapse(options) {
  var scrollCollapse = new ScrollCollapse(options);
  scrollCollapse.start();
}

exports.default = startScrollCollapse;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPassiveEventHandlerOption = createPassiveEventHandlerOption;
/**
 * Passive event handler option, cross-browser.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window */

/**
 * @returns {Object|Boolean} A support-sensitive passive event handler option.
 */
function createPassiveEventHandlerOption() {
  var passiveSupported = false;

  try {
    var testOpts = {
      get passive() {
        passiveSupported = true;
        return true;
      }
    };
    window.addEventListener('test', null, testOpts);
  } catch (err) {} // eslint-disable-line

  return passiveSupported ? {
    passive: true
  } : false;
}

exports.default = createPassiveEventHandlerOption;

/***/ })
/******/ ]);