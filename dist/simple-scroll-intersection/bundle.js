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


var _simpleScrollIntersection = __webpack_require__(1);

function updateElement(element, result) {
  var direction = Object.keys(result.from).filter(function (key) {
    return result.from[key];
  });

  element.classList.toggle('intersected');

  if (result.intersection) {
    this.directionClass = direction + '-x';
    element.classList.add(this.directionClass);
  } else {
    element.classList.remove(this.directionClass);
  }
} /**
   * Entry for simple-scroll-intersection demo.
   *
   * Moves four elements around on scroll, updates them on dis/intersection.
   */
/* global window, document, requestAnimationFrame */
/* eslint-disable import/no-unresolved */


window.addEventListener('DOMContentLoaded', function () {
  var scrollTick = false;
  var scrollSelector = 'body';
  var targetSelector = '.target';
  var ssiUpdates = [];

  var _reduce = ['.top', '.right', '.bottom', '.left'].reduce(function (prev, curr) {
    var acc = prev;
    var el = document.querySelector(curr);

    ssiUpdates.push((0, _simpleScrollIntersection.createSimpleScrollIntersection)({
      scrollSelector: scrollSelector,
      movingSelector: curr,
      target: targetSelector,
      notify: updateElement.bind({}, el)
    }).getUpdateScroll());

    acc[curr.substring(1)] = el;
    return acc;
  }, {}),
      top = _reduce.top,
      right = _reduce.right,
      bottom = _reduce.bottom,
      left = _reduce.left;

  function updateScroll() {
    var y = window.scrollY;

    top.style.transform = 'translate3d(-50%, ' + y * 1.5 + 'px, 0)';
    right.style.transform = 'translate3d(' + -(y * 1.5) + 'px, -50%, 0)';
    bottom.style.transform = 'translate3d(-50%, ' + -y + 'px, 0)';
    left.style.transform = 'translate3d(' + y + 'px, -50%, 0)';

    ssiUpdates.forEach(function (update) {
      return update();
    });
  }

  window.addEventListener('scroll', function () {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(function () {
        updateScroll();
        scrollTick = false;
      });
    }
  }, {
    passive: true
  });
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SSIConst = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Simple Scroll Intersection behavior.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Use when you have a simple situation/animation where IntersectionObserver
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * doesn't make sense.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
/* global window, document */

/* eslint-disable import/no-unresolved */


exports.createSimpleScrollIntersection = createSimpleScrollIntersection;

var _passiveEvent = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-enable import/no-unresolved */

var SSIConst = exports.SSIConst = function () {
  function SSIConst() {
    _classCallCheck(this, SSIConst);
  }

  _createClass(SSIConst, null, [{
    key: 'top',
    get: function get() {
      return 'top';
    }
  }, {
    key: 'bottom',
    get: function get() {
      return 'bottom';
    }
  }, {
    key: 'left',
    get: function get() {
      return 'left';
    }
  }, {
    key: 'right',
    get: function get() {
      return 'right';
    }
  }]);

  return SSIConst;
}();

var SimpleScrollIntersection = function () {
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
  function SimpleScrollIntersection(options) {
    _classCallCheck(this, SimpleScrollIntersection);

    var noop = function noop() {
      return null;
    };
    var badEl = {
      getBoundingClientRect: noop
    };

    this.opts = Object.assign({}, {
      notify: noop
    }, options);

    this.notify = setTimeout.bind(null, this.opts.notify, 0);
    if (this.opts.notify === noop) {
      console.warn('notify option must be supplied to get results'); // eslint-disable-line
    }

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn('failed to identify a scroll source with "' + this.opts.scrollSelector + '"'); // eslint-disable-line
    }

    this.targetRectFn = SimpleScrollIntersection.optionRectFn(this.opts.target);
    if (!this.targetRectFn) {
      console.warn('failed to compute target rect on "' + this.opts.target + '"'); // eslint-disable-line
    }

    this.moving = document.querySelector(this.opts.movingSelector) || badEl;
    if (!this.moving.getBoundingClientRect()) {
      console.warn('failed to compute moving rect on "' + this.opts.movingSelector + '"'); // eslint-disable-line
    }

    this.tickScroll = false;
    this.intersected = this.computeIntersection().intersection;

    this.onScroll = this.onScroll.bind(this);

    this.passiveEventOption = (0, _passiveEvent.createPassiveEventHandlerOption)();
  }

  _createClass(SimpleScrollIntersection, [{
    key: 'computeIntersection',


    /**
     * Computes intersection of moving vs target Rects.
     * Moving rect is recalculated here.
     *
     * @returns {Object} intersection boolean and direction booleans.
     */
    value: function computeIntersection() {
      var from = {};
      var rect1 = this.targetRectFn();
      var rect2 = this.moving.getBoundingClientRect();

      if (!rect2 || !rect1) {
        return { intersection: false, from: from };
      }

      var top = Math.max(rect1.top, rect2.top);
      var bottom = Math.min(rect1.bottom, rect2.bottom);
      var left = Math.max(rect1.left, rect2.left);
      var right = Math.min(rect1.right, rect2.right);
      var width = right - left;
      var height = bottom - top;

      var intersection = width >= 0 && height >= 0;

      from[SSIConst.top] = rect2.bottom >= rect1.top && rect2.top < rect1.top;
      from[SSIConst.bottom] = rect2.top <= rect1.bottom && rect2.bottom > rect1.bottom;
      from[SSIConst.left] = rect2.right >= rect1.left && rect2.left < rect1.left;
      from[SSIConst.right] = rect2.left <= rect1.right && rect2.right > rect1.right;

      return { intersection: intersection, from: from };
    }

    /**
     * Throttling scroll event handler.
     */

  }, {
    key: 'onScroll',
    value: function onScroll() {
      var _this = this;

      if (!this.tickScroll) {
        this.tickScroll = true;
        window.requestAnimationFrame(function () {
          _this.updateScroll();
          _this.tickScroll = false;
        });
      }
    }

    /**
     * Does the work of the scroll event.
     * Compute intersection and send notification.
     */

  }, {
    key: 'updateScroll',
    value: function updateScroll() {
      var result = this.computeIntersection();

      if (this.intersected && !result.intersection) {
        this.intersected = false;
        this.notify(result);
      } else if (!this.intersected && result.intersection) {
        this.intersected = true;
        this.notify(result);
      }
    }
  }, {
    key: 'start',
    value: function start() {
      this.scrollSource.addEventListener('scroll', this.onScroll, this.passiveEventOption);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.scrollSource.removeEventListener('scroll', this.onScroll);
    }
  }], [{
    key: 'optionRectFn',
    value: function optionRectFn(selectorOrFn) {
      var rectFn = void 0;
      if (typeof selectorOrFn === 'function') {
        rectFn = selectorOrFn;
      } else {
        var el = document.querySelector(selectorOrFn);
        if (el) {
          rectFn = el.getBoundingClientRect.bind(el);
        }
      }
      return rectFn;
    }
  }]);

  return SimpleScrollIntersection;
}();

/**
 * Creates the public interface for a SimpleScrollIntersection instance.
 * @see SimpleScrollIntersection constructor for options.
 */


function createSimpleScrollIntersection(options) {
  var ssi = new SimpleScrollIntersection(options);
  return {
    getUpdateScroll: function getUpdateScroll() {
      return ssi.updateScroll.bind(ssi);
    },
    start: ssi.start.bind(ssi),
    stop: ssi.stop.bind(ssi)
  };
}

exports.default = createSimpleScrollIntersection;

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