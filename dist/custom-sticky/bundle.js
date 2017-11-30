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


var _parallax = __webpack_require__(1);

var _customSticky = __webpack_require__(2);

/**
 * Entry module for custom-sticky example.
 */
/* global window, document */
/* eslint-disable import/no-unresolved, import/extensions */
window.addEventListener('DOMContentLoaded', function () {
  var mainSelector = '.main';
  var mainElement = document.querySelector(mainSelector);
  var navContainer = document.querySelector('.navigation-container');
  var blockAnimationLength = (document.querySelector('.cs-ctr').getBoundingClientRect().bottom - document.querySelector('.cs-ttb').getBoundingClientRect().bottom) * 1.2;

  (0, _parallax.initializeParallax)(mainElement);

  var csBehaviors = [(0, _customSticky.createCustomSticky)({
    scrollSelector: mainSelector,
    movingSelector: '.cs-ttb',
    target: '.cs-ctr',
    animationLength: function animationLength() {
      return blockAnimationLength;
    },
    direction: _customSticky.CSDirection.down,
    transform: function transform(y) {
      return 'translateX(-50%) translateY(' + y + 'px)';
    }
  }), (0, _customSticky.createCustomSticky)({
    scrollSelector: mainSelector,
    movingSelector: '.cs-ltr',
    target: '.cs-ctr',
    animationLength: function animationLength() {
      return blockAnimationLength;
    },
    direction: _customSticky.CSDirection.right
  }), (0, _customSticky.createCustomSticky)({
    scrollSelector: mainSelector,
    movingSelector: '.cs-rtl',
    target: '.cs-ctr',
    animationLength: function animationLength() {
      return blockAnimationLength;
    },
    direction: _customSticky.CSDirection.left
  }), (0, _customSticky.createCustomSticky)({
    scrollSelector: mainSelector,
    movingSelector: '.cs-end',
    target: function target() {
      var cRect = mainElement.getBoundingClientRect();
      var leftEdgeRect = {
        left: cRect.left,
        right: cRect.left,
        top: cRect.top,
        bottom: cRect.bottom,
        width: 0,
        height: cRect.height
      };
      return leftEdgeRect;
    },
    transform: function transform(x) {
      var value = x <= 16 ? '-50%' : -x + 'px';
      return 'translateX(' + value + ')';
    },
    direction: _customSticky.CSDirection.left
  })];

  (0, _customSticky.createCustomSticky)({
    scrollSelector: mainSelector,
    movingSelector: '.navigation-container',
    target: 'header',
    alwaysVisible: true,
    animationLength: function animationLength() {
      return navContainer.getBoundingClientRect().top;
    },
    notify: function notify() {
      document.querySelector('header').classList.toggle('tint');
    },
    direction: _customSticky.CSDirection.up
  }).start(csBehaviors);
}, {
  once: true
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeParallax = initializeParallax;
exports.onResize = onResize;
/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/* global window, document, getComputedStyle */
/* eslint-disable */
function initializeParallax(clip) {
  var parallax = clip.querySelectorAll('*[parallax]');
  var parallaxDetails = [];
  var sticky = false;

  // Edge requires a transform on the document body and a fixed position element
  // in order for it to properly render the parallax effect as you scroll.
  // See https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/5084491/
  if (getComputedStyle(document.body).transform == 'none') document.body.style.transform = 'translateZ(0)';
  var fixedPos = document.createElement('div');
  fixedPos.style.position = 'fixed';
  fixedPos.style.top = '0';
  fixedPos.style.width = '1px';
  fixedPos.style.height = '1px';
  fixedPos.style.zIndex = 1;
  document.body.insertBefore(fixedPos, document.body.firstChild);

  for (var i = 0; i < parallax.length; i++) {
    var elem = parallax[i];
    var container = elem.parentNode;
    if (getComputedStyle(container).overflow != 'visible') {
      console.error('Need non-scrollable container to apply perspective for', elem);
      continue;
    }
    if (clip && container.parentNode != clip) {
      console.warn('Currently we only track a single overflow clip, but elements from multiple clips found.', elem);
    }
    var clip = container.parentNode;
    if (getComputedStyle(clip).overflow == 'visible') {
      console.error('Parent of sticky container should be scrollable element', elem);
    }
    // TODO(flackr): optimize to not redo this for the same clip/container.
    var perspectiveElement;
    if (sticky || getComputedStyle(clip).webkitOverflowScrolling) {
      sticky = true;
      perspectiveElement = container;
    } else {
      perspectiveElement = clip;
      container.style.transformStyle = 'preserve-3d';
    }
    perspectiveElement.style.perspectiveOrigin = 'bottom right';
    perspectiveElement.style.perspective = '1px';
    if (sticky) elem.style.position = '-webkit-sticky';
    if (sticky) elem.style.top = '0';
    elem.style.transformOrigin = 'bottom right';

    // Find the previous and next elements to parallax between.
    var previousCover = parallax[i].previousElementSibling;
    while (previousCover && previousCover.hasAttribute('parallax')) {
      previousCover = previousCover.previousElementSibling;
    }var nextCover = parallax[i].nextElementSibling;
    while (nextCover && !nextCover.hasAttribute('parallax-cover')) {
      nextCover = nextCover.nextElementSibling;
    }parallaxDetails.push({ 'node': parallax[i],
      'top': parallax[i].offsetTop,
      'sticky': !!sticky,
      'nextCover': nextCover,
      'previousCover': previousCover });
  }

  // Add a scroll listener to hide perspective elements when they should no
  // longer be visible.
  clip.addEventListener('scroll', function () {
    for (var i = 0; i < parallaxDetails.length; i++) {
      var container = parallaxDetails[i].node.parentNode;
      var previousCover = parallaxDetails[i].previousCover;
      var nextCover = parallaxDetails[i].nextCover;
      var parallaxStart = previousCover ? previousCover.offsetTop + previousCover.offsetHeight : 0;
      var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
      var threshold = 200;
      var visible = parallaxStart - threshold - clip.clientHeight < clip.scrollTop && parallaxEnd + threshold > clip.scrollTop;
      // FIXME: Repainting the images while scrolling can cause jank.
      // For now, keep them all.
      // var display = visible ? 'block' : 'none'
      var display = 'block';
      if (parallaxDetails[i].node.style.display != display) parallaxDetails[i].node.style.display = display;
    }
  });
  window.addEventListener('resize', onResize.bind(null, parallaxDetails));
  onResize(parallaxDetails);
  for (var i = 0; i < parallax.length; i++) {
    parallax[i].parentNode.insertBefore(parallax[i], parallax[i].parentNode.firstChild);
  }
}

function onResize(details) {
  for (var i = 0; i < details.length; i++) {
    var container = details[i].node.parentNode;

    var clip = container.parentNode;
    var previousCover = details[i].previousCover;
    var nextCover = details[i].nextCover;
    var rate = details[i].node.getAttribute('parallax');

    var parallaxStart = previousCover ? previousCover.offsetTop + previousCover.offsetHeight : 0;
    var scrollbarWidth = details[i].sticky ? 0 : clip.offsetWidth - clip.clientWidth;
    var parallaxElem = details[i].sticky ? container : clip;
    var height = details[i].node.offsetHeight;
    var depth = 0;
    if (rate) {
      depth = 1 - 1 / rate;
    } else {
      var parallaxEnd = nextCover ? nextCover.offsetTop : container.offsetHeight;
      depth = (height - parallaxEnd + parallaxStart) / (height - clip.clientHeight);
    }
    if (details[i].sticky) depth = 1.0 / depth;

    var scale = 1.0 / (1.0 - depth);

    // The scrollbar is included in the 'bottom right' perspective origin.
    var dx = scrollbarWidth * (scale - 1);
    // Offset for the position within the container.
    var dy = details[i].sticky ? -(clip.scrollHeight - parallaxStart - height) * (1 - scale) : (parallaxStart - depth * (height - clip.clientHeight)) * scale;

    details[i].node.style.transform = 'scale(' + (1 - depth) + ') translate3d(' + dx + 'px, ' + dy + 'px, ' + depth + 'px)';
  }
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSDirection = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Custom Sticky behavior: A specialized, composable scroll animation.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Moves an element driven by scroll to a target element, where it stops moving,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * or "sticks".
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
/* global document, window */
/* eslint-disable import/no-unresolved */


exports.createCustomSticky = createCustomSticky;

var _intersectionObserver = __webpack_require__(3);

var _passiveEvent = __webpack_require__(5);

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CSDirection = exports.CSDirection = function () {
  function CSDirection() {
    _classCallCheck(this, CSDirection);
  }

  _createClass(CSDirection, null, [{
    key: 'up',
    get: function get() {
      return 'up';
    }
  }, {
    key: 'down',
    get: function get() {
      return 'down';
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

  return CSDirection;
}();

var CustomSticky = function () {
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
  function CustomSticky(options) {
    var _this = this;

    _classCallCheck(this, CustomSticky);

    this.opts = Object.assign({}, {
      resizeWait: 150,
      direction: CSDirection.up,
      alwaysVisible: false,
      animationLength: function animationLength() {
        return window.innerHeight;
      }
    }, options);

    this.scrollSource = document.querySelector(this.opts.scrollSelector);
    if (!this.scrollSource) {
      console.warn('failed to identify a scroll source with "' + this.opts.scrollSelector + '"'); // eslint-disable-line
    }

    var targetRectFn = CustomSticky.optionRectFn(this.opts.target);
    if (!targetRectFn) {
      targetRectFn = function targetRectFn() {
        return {};
      };
      console.warn('failed to identify targetElement with "' + this.opts.target + '"'); // eslint-disable-line
    }

    this.movingElement = document.querySelector(this.opts.movingSelector);
    if (!this.movingElement) {
      console.warn('failed to identify moving element with "' + this.opts.movingSelector + '"'); // eslint-disable-line
    }

    this.notify = this.opts.notify ? setTimeout.bind(null, this.opts.notify, 0) : function () {
      return false;
    };

    switch (this.opts.direction) {
      case CSDirection.right:
        this.transform = function (boundY) {
          return 'translateX(' + boundY + 'px)';
        };
        this.traverseLength = function () {
          return Math.ceil(targetRectFn().left - _this.movingElement.getBoundingClientRect().right);
        };
        break;
      case CSDirection.left:
        this.transform = function (boundY) {
          return 'translateX(' + -boundY + 'px)';
        };
        this.traverseLength = function () {
          return Math.ceil(_this.movingElement.getBoundingClientRect().left - targetRectFn().right);
        };
        break;
      case CSDirection.down:
        this.transform = function (boundY) {
          return 'translateY(' + boundY + 'px)';
        };
        this.traverseLength = function () {
          return Math.ceil(targetRectFn().top - _this.movingElement.getBoundingClientRect().bottom);
        };
        break;
      default:
      case CSDirection.up:
        this.transform = function (boundY) {
          return 'translateY(' + -boundY + 'px)';
        };
        this.traverseLength = function () {
          return Math.ceil(_this.movingElement.getBoundingClientRect().top - targetRectFn().bottom);
        };
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
      console.warn('traverseLength must return a positive number'); // eslint-disable-line
    }

    this.animationLength = this.opts.animationLength();

    this.tickScroll = false;
    this.tickResize = false;
    this.started = false;

    this.yBasisOrigins = _defineProperty({}, window.innerHeight, null);

    this.yBasis = undefined;
    this.saveY = 0;
    this.animate = true;

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onIntersection = this.onIntersection.bind(this);

    this.yBasisPromise = new Promise(function (resolve) {
      _this.yBasisResolver = resolve;
    });

    var observer = (0, _intersectionObserver.createIntersectionObserver)(this.onIntersection);
    observer.observe(this.movingElement);

    this.passiveEventOption = (0, _passiveEvent.createPassiveEventHandlerOption)();

    window.addEventListener('resize', this.onResize, this.passiveEventOption);
  }

  /**
   * Convert selector or function to function that returns Rect.
   *
   * @param {String|Function} selectorOrFn - A selector or function that returns
   * a Rect.
   * @returns {Function} A function that returns a Rect.
   */


  _createClass(CustomSticky, [{
    key: 'resetYBasisPromise',


    /**
     * Create a new yBasis promise and resolver.
     * Only if not alwaysVisible.
     */
    value: function resetYBasisPromise() {
      var _this2 = this;

      if (!this.opts.alwaysVisible) {
        this.yBasisPromise = new Promise(function (resolve) {
          _this2.yBasisResolver = resolve;
        });
      }
    }

    /**
     * Throttled resize event handler.
     * Calculates a new top bound for the scroll animation.
     */

  }, {
    key: 'onResize',
    value: function onResize() {
      var _this3 = this;

      if (!this.tickResize) {
        this.tickResize = true;
        setTimeout(function () {
          window.requestAnimationFrame(function () {
            _this3.updateResize(_this3.scrollSource.scrollTop);
            _this3.tickResize = false;
          });
        }, this.opts.resizeWait);
      }
    }

    /**
     * Throttled scroll event handler.
     */

  }, {
    key: 'onScroll',
    value: function onScroll() {
      var _this4 = this;

      if (!this.tickScroll) {
        this.tickScroll = true;
        window.requestAnimationFrame(function () {
          _this4.updateScroll(_this4.scrollSource.scrollTop);
          _this4.tickScroll = false;
        });
      }
    }

    /**
     * Intersection observer callback handler.
     */

  }, {
    key: 'onIntersection',
    value: function onIntersection(entries) {
      var _this5 = this;

      var aoi = entries.filter(function (e) {
        return e.target.isEqualNode(_this5.movingElement);
      });
      var entry = aoi && aoi.length > 0 ? aoi[0] : null;

      if (entry) {
        var intersected = entry.intersectionRect.width > 0 || entry.intersectionRect.height > 0;

        var viewportHeight = window.innerHeight;
        var viewportWidth = window.innerWidth;
        var scrollTop = this.scrollSource.scrollTop; // eslint-disable-line
        var mustInitOrigin = !this.yBasisOrigins[viewportHeight];

        if (mustInitOrigin) {
          this.yBasisOrigins[viewportHeight] = {
            intersected: intersected,
            basis: intersected ? scrollTop : 0
          };
        }

        if (intersected) {
          var fromTop = entry.intersectionRect.top < viewportHeight / 2;
          var fromSide = Math.abs(viewportWidth - entry.intersectionRect.right) < viewportWidth / 10 || entry.intersectionRect.left < viewportWidth / 10;

          if (!this.yBasisOrigins[viewportHeight].intersected && !fromTop) {
            this.yBasisOrigins[viewportHeight].intersected = true;
            this.yBasisOrigins[viewportHeight].basis = scrollTop;
          }

          this.yBasis = fromTop || fromSide ? this.yBasisOrigins[viewportHeight].basis : scrollTop;
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

  }, {
    key: 'updateResize',
    value: function updateResize(y) {
      var previousTransform = this.movingElement.style.transform;
      this.movingElement.style.transform = this.transform(0);
      /* eslint-disable no-unused-expressions */
      // Force any incidental changes to take hold right now
      window.getComputedStyle(this.movingElement).transform;
      /* eslint-enable no-unused-expressions */

      this.uBound = this.traverseLength();
      this.animationLength = this.opts.animationLength();

      if (this.started) {
        var viewportHeight = window.innerHeight;
        var yBasisEntry = 0;
        if (this.yBasisOrigins[viewportHeight]) {
          yBasisEntry = this.yBasisOrigins[viewportHeight].basis;
        }
        var progress = this.calculateProgress(y);
        var wouldAnimate = progress < this.uBound && y >= yBasisEntry;

        if (wouldAnimate && !this.animate) {
          this.animate = true;
          this.scrollSource.scrollTop = y + this.uBound;
        } else {
          this.updateScroll(y, true);
          // Set in case stop/start using getLastY
          this.saveY = Math.min(y,
          // equation is calculateProgress but solve for y
          this.animationLength * (Math.min(progress, this.uBound) / this.uBound) + yBasisEntry);
        }
      } else /* if (typeof this.yBasis !== 'undefined') */{
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

  }, {
    key: 'browserBugUpdateUbound',
    value: function browserBugUpdateUbound(ignore) {
      if (ignore || this.uBoundAccurate) {
        return;
      }

      this.uBoundAccurate = true;
      var uBound = this.traverseLength();
      if (uBound > this.uBound) {
        this.uBound = uBound;
      }
    }

    /**
     * Given scroll y, calculate the progress to uBound.
     *
     * @param {Number} y - A scroll y value.
     */

  }, {
    key: 'calculateProgress',
    value: function calculateProgress(y) {
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

  }, {
    key: 'updateScroll',
    value: function updateScroll(y, forceAnimate) {
      if (typeof this.yBasis === 'undefined') {
        return;
      }

      this.browserBugUpdateUbound(forceAnimate);

      var progress = this.calculateProgress(y);
      var top = y === 0;

      if (this.animate || top || forceAnimate) {
        var shouldStick = this.uBound <= progress;
        var fastTop = !this.animate && top && !forceAnimate;
        var transform = Math.min(progress, this.uBound);

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

  }, {
    key: 'start',
    value: function start(startY) {
      var _this6 = this;

      this.yBasisPromise.then(function () {
        _this6.scrollSource.addEventListener('scroll', _this6.onScroll, _this6.passiveEventOption);

        _this6.started = true;

        var y = _this6.scrollSource.scrollTop;
        var shouldScroll = typeof startY !== 'undefined' && y < startY;

        if (shouldScroll) {
          _this6.scrollSource.scrollTop = startY;
        } else {
          _this6.updateScroll(y, true);
        }
      });
    }

    /**
     * Stop the custom sticky behavior.
     */

  }, {
    key: 'stop',
    value: function stop() {
      this.scrollSource.removeEventListener('scroll', this.onScroll);
      this.started = false;
      this.resetYBasisPromise();
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

  return CustomSticky;
}();

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


function createCustomSticky() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var customSticky = new CustomSticky(options);
  var startedPeers = void 0;

  return {
    _: {
      getUpdateResize: function getUpdateResize() {
        return customSticky.updateResize.bind(customSticky);
      },
      getUpdateScroll: function getUpdateScroll() {
        return function (y, fa) {
          return customSticky.yBasisPromise.then(function () {
            customSticky.updateScroll(y, fa);
          });
        };
      },
      reset: customSticky.resetYBasisPromise.bind(customSticky)
    },
    getLastY: function getLastY() {
      return customSticky.saveY;
    },
    /**
     * @param {Array} [peers] - Collection of CustomSticky objects listening on
     * the same scroll source that should be started with this CustomSticky and
     * serviced in one RAF.
     *
     * @param {Number} [startY] - A y value to start at.
     */
    start: function start(peers, startY) {
      var startedWithPeers = Array.isArray(peers) && peers.length > 0;

      if (startedWithPeers) {
        var selfUpdateScroll = CustomSticky.prototype.updateScroll.bind(customSticky);
        var peerUpdateScrolls = peers.map(function (peer) {
          return peer._.getUpdateScroll();
        });

        customSticky.updateScroll = function (y, force) {
          selfUpdateScroll(y, force);
          peerUpdateScrolls.forEach(function (update) {
            return update(y, force);
          });
        };

        var selfUpdateResize = CustomSticky.prototype.updateResize.bind(customSticky);
        var peerUpdateResizes = peers.map(function (peer) {
          return peer._.getUpdateResize();
        });

        customSticky.updateResize = function (y) {
          selfUpdateResize(y);
          peerUpdateResizes.forEach(function (update) {
            return update(y);
          });
        };

        startedPeers = peers;
      } else {
        startedPeers = null;
      }

      customSticky.start(startY);
    },
    stop: function stop() {
      if (startedPeers) {
        startedPeers.forEach(function (peer) {
          return peer._.reset();
        });
      }

      customSticky.stop();
    }
  };
}

exports.default = createCustomSticky;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createIntersectionObserver = createIntersectionObserver;

__webpack_require__(4);

function createIntersectionObserver(callback, options) {
  return new IntersectionObserver(callback, options);
} /**
   * Contain the intersection-observer/polyfill.
   */
/* global IntersectionObserver */
/* eslint-disable import/no-unresolved */

// Polyfill the global IntersectionObserver/Entry, if required.
exports.default = createIntersectionObserver;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (window, document) {
  'use strict';

  // Exits early if all IntersectionObserver and IntersectionObserverEntry
  // features are natively supported.

  if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    return;
  }

  // Use :root element of the document for .contains() calls because older IEs
  // support Node.prototype.contains only on Element nodes.
  var docElement = document.documentElement;

  /**
   * An IntersectionObserver registry. This registry exists to hold a strong
   * reference to IntersectionObserver instances currently observering a target
   * element. Without this registry, instances without another reference may be
   * garbage collected.
   */
  var registry = [];

  /**
   * Creates the global IntersectionObserverEntry constructor.
   * https://wicg.github.io/IntersectionObserver/#intersection-observer-entry
   * @param {Object} entry A dictionary of instance properties.
   * @constructor
   */
  function IntersectionObserverEntry(entry) {
    this.time = entry.time;
    this.target = entry.target;
    this.rootBounds = entry.rootBounds;
    this.boundingClientRect = entry.boundingClientRect;
    this.intersectionRect = entry.intersectionRect || getEmptyRect();
    this.isIntersecting = !!entry.intersectionRect;

    // Calculates the intersection ratio. Sets it to 0 if the target area is 0.
    var targetRect = this.boundingClientRect;
    var targetArea = targetRect.width * targetRect.height;
    var intersectionRect = this.intersectionRect;
    var intersectionArea = intersectionRect.width * intersectionRect.height;
    this.intersectionRatio = targetArea ? intersectionArea / targetArea : 0;
  }

  /**
   * Creates the global IntersectionObserver constructor.
   * https://wicg.github.io/IntersectionObserver/#intersection-observer-interface
   * @param {Function} callback The function to be invoked after intersection
   *     changes have queued. The function is not invoked if the queue has
   *     been emptied by calling the `takeRecords` method.
   * @param {Object=} opt_options Optional configuration options.
   * @constructor
   */
  function IntersectionObserver(callback, opt_options) {

    var options = opt_options || {};

    if (typeof callback != 'function') {
      throw new Error('callback must be a function');
    }

    if (options.root && options.root.nodeType != 1) {
      throw new Error('root must be an Element');
    }

    // Binds and throttles `this._checkForIntersections`.
    this._checkForIntersections = throttle(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

    // Private properties.
    this._callback = callback;
    this._observationTargets = [];
    this._queuedEntries = [];
    this._rootMarginValues = this._parseRootMargin(options.rootMargin);

    // Public properties.
    this.thresholds = this._initThresholds(options.threshold);
    this.root = options.root || null;
    this.rootMargin = this._rootMarginValues.map(function (margin) {
      return margin.value + margin.unit;
    }).join(' ');
  }

  /**
   * The minimum interval within which the document will be checked for
   * intersection changes.
   */
  IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;

  /**
   * The frequency in which the polyfill polls for intersection changes.
   * this can be updated on a per instance basis and must be set prior to
   * calling `observe` on the first target.
   */
  IntersectionObserver.prototype.POLL_INTERVAL = null;

  /**
   * Starts observing a target element for intersection changes based on
   * the thresholds values.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.observe = function (target) {
    // If the target is already being observed, do nothing.
    if (this._observationTargets.some(function (item) {
      return item.element == target;
    })) {
      return;
    }

    if (!(target && target.nodeType == 1)) {
      throw new Error('target must be an Element');
    }

    this._registerInstance();
    this._observationTargets.push({ element: target, entry: null });
    this._monitorIntersections();
  };

  /**
   * Stops observing a target element for intersection changes.
   * @param {Element} target The DOM element to observe.
   */
  IntersectionObserver.prototype.unobserve = function (target) {
    this._observationTargets = this._observationTargets.filter(function (item) {

      return item.element != target;
    });
    if (!this._observationTargets.length) {
      this._unmonitorIntersections();
      this._unregisterInstance();
    }
  };

  /**
   * Stops observing all target elements for intersection changes.
   */
  IntersectionObserver.prototype.disconnect = function () {
    this._observationTargets = [];
    this._unmonitorIntersections();
    this._unregisterInstance();
  };

  /**
   * Returns any queue entries that have not yet been reported to the
   * callback and clears the queue. This can be used in conjunction with the
   * callback to obtain the absolute most up-to-date intersection information.
   * @return {Array} The currently queued entries.
   */
  IntersectionObserver.prototype.takeRecords = function () {
    var records = this._queuedEntries.slice();
    this._queuedEntries = [];
    return records;
  };

  /**
   * Accepts the threshold value from the user configuration object and
   * returns a sorted array of unique threshold values. If a value is not
   * between 0 and 1 and error is thrown.
   * @private
   * @param {Array|number=} opt_threshold An optional threshold value or
   *     a list of threshold values, defaulting to [0].
   * @return {Array} A sorted list of unique and valid threshold values.
   */
  IntersectionObserver.prototype._initThresholds = function (opt_threshold) {
    var threshold = opt_threshold || [0];
    if (!Array.isArray(threshold)) threshold = [threshold];

    return threshold.sort().filter(function (t, i, a) {
      if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
        throw new Error('threshold must be a number between 0 and 1 inclusively');
      }
      return t !== a[i - 1];
    });
  };

  /**
   * Accepts the rootMargin value from the user configuration object
   * and returns an array of the four margin values as an object containing
   * the value and unit properties. If any of the values are not properly
   * formatted or use a unit other than px or %, and error is thrown.
   * @private
   * @param {string=} opt_rootMargin An optional rootMargin value,
   *     defaulting to '0px'.
   * @return {Array<Object>} An array of margin objects with the keys
   *     value and unit.
   */
  IntersectionObserver.prototype._parseRootMargin = function (opt_rootMargin) {
    var marginString = opt_rootMargin || '0px';
    var margins = marginString.split(/\s+/).map(function (margin) {
      var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
      if (!parts) {
        throw new Error('rootMargin must be specified in pixels or percent');
      }
      return { value: parseFloat(parts[1]), unit: parts[2] };
    });

    // Handles shorthand.
    margins[1] = margins[1] || margins[0];
    margins[2] = margins[2] || margins[0];
    margins[3] = margins[3] || margins[1];

    return margins;
  };

  /**
   * Starts polling for intersection changes if the polling is not already
   * happening, and if the page's visibilty state is visible.
   * @private
   */
  IntersectionObserver.prototype._monitorIntersections = function () {
    if (!this._monitoringIntersections) {
      this._monitoringIntersections = true;

      this._checkForIntersections();

      // If a poll interval is set, use polling instead of listening to
      // resize and scroll events or DOM mutations.
      if (this.POLL_INTERVAL) {
        this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL);
      } else {
        addEvent(window, 'resize', this._checkForIntersections, true);
        addEvent(document, 'scroll', this._checkForIntersections, true);

        if ('MutationObserver' in window) {
          this._domObserver = new MutationObserver(this._checkForIntersections);
          this._domObserver.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
    }
  };

  /**
   * Stops polling for intersection changes.
   * @private
   */
  IntersectionObserver.prototype._unmonitorIntersections = function () {
    if (this._monitoringIntersections) {
      this._monitoringIntersections = false;

      clearInterval(this._monitoringInterval);
      this._monitoringInterval = null;

      removeEvent(window, 'resize', this._checkForIntersections, true);
      removeEvent(document, 'scroll', this._checkForIntersections, true);

      if (this._domObserver) {
        this._domObserver.disconnect();
        this._domObserver = null;
      }
    }
  };

  /**
   * Scans each observation target for intersection changes and adds them
   * to the internal entries queue. If new entries are found, it
   * schedules the callback to be invoked.
   * @private
   */
  IntersectionObserver.prototype._checkForIntersections = function () {
    var rootIsInDom = this._rootIsInDom();
    var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

    this._observationTargets.forEach(function (item) {
      var target = item.element;
      var targetRect = getBoundingClientRect(target);
      var rootContainsTarget = this._rootContainsTarget(target);
      var oldEntry = item.entry;
      var intersectionRect = rootIsInDom && rootContainsTarget && this._computeTargetAndRootIntersection(target, rootRect);

      var newEntry = item.entry = new IntersectionObserverEntry({
        time: now(),
        target: target,
        boundingClientRect: targetRect,
        rootBounds: rootRect,
        intersectionRect: intersectionRect
      });

      if (rootIsInDom && rootContainsTarget) {
        // If the new entry intersection ratio has crossed any of the
        // thresholds, add a new entry.
        if (this._hasCrossedThreshold(oldEntry, newEntry)) {
          this._queuedEntries.push(newEntry);
        }
      } else {
        // If the root is not in the DOM or target is not contained within
        // root but the previous entry for this target had an intersection,
        // add a new record indicating removal.
        if (oldEntry && oldEntry.isIntersecting) {
          this._queuedEntries.push(newEntry);
        }
      }
    }, this);

    if (this._queuedEntries.length) {
      this._callback(this.takeRecords(), this);
    }
  };

  /**
   * Accepts a target and root rect computes the intersection between then
   * following the algorithm in the spec.
   * TODO(philipwalton): at this time clip-path is not considered.
   * https://wicg.github.io/IntersectionObserver/#calculate-intersection-rect-algo
   * @param {Element} target The target DOM element
   * @param {Object} rootRect The bounding rect of the root after being
   *     expanded by the rootMargin value.
   * @return {?Object} The final intersection rect object or undefined if no
   *     intersection is found.
   * @private
   */
  IntersectionObserver.prototype._computeTargetAndRootIntersection = function (target, rootRect) {

    // If the element isn't displayed, an intersection can't happen.
    if (window.getComputedStyle(target).display == 'none') return;

    var targetRect = getBoundingClientRect(target);
    var intersectionRect = targetRect;
    var parent = target.parentNode;
    var atRoot = false;

    while (!atRoot) {
      var parentRect = null;

      // If we're at the root element, set parentRect to the already
      // calculated rootRect.
      if (parent == this.root || parent.nodeType != 1) {
        atRoot = true;
        parentRect = rootRect;
      }
      // Otherwise check to see if the parent element hides overflow,
      // and if so update parentRect.
      else {
          if (window.getComputedStyle(parent).overflow != 'visible') {
            parentRect = getBoundingClientRect(parent);
          }
        }
      // If either of the above conditionals set a new parentRect,
      // calculate new intersection data.
      if (parentRect) {
        intersectionRect = computeRectIntersection(parentRect, intersectionRect);

        if (!intersectionRect) break;
      }
      parent = parent.parentNode;
    }
    return intersectionRect;
  };

  /**
   * Returns the root rect after being expanded by the rootMargin value.
   * @return {Object} The expanded root rect.
   * @private
   */
  IntersectionObserver.prototype._getRootRect = function () {
    var rootRect;
    if (this.root) {
      rootRect = getBoundingClientRect(this.root);
    } else {
      // Use <html>/<body> instead of window since scroll bars affect size.
      var html = document.documentElement;
      var body = document.body;
      rootRect = {
        top: 0,
        left: 0,
        right: html.clientWidth || body.clientWidth,
        width: html.clientWidth || body.clientWidth,
        bottom: html.clientHeight || body.clientHeight,
        height: html.clientHeight || body.clientHeight
      };
    }
    return this._expandRectByRootMargin(rootRect);
  };

  /**
   * Accepts a rect and expands it by the rootMargin value.
   * @param {Object} rect The rect object to expand.
   * @return {Object} The expanded rect.
   * @private
   */
  IntersectionObserver.prototype._expandRectByRootMargin = function (rect) {
    var margins = this._rootMarginValues.map(function (margin, i) {
      return margin.unit == 'px' ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100;
    });
    var newRect = {
      top: rect.top - margins[0],
      right: rect.right + margins[1],
      bottom: rect.bottom + margins[2],
      left: rect.left - margins[3]
    };
    newRect.width = newRect.right - newRect.left;
    newRect.height = newRect.bottom - newRect.top;

    return newRect;
  };

  /**
   * Accepts an old and new entry and returns true if at least one of the
   * threshold values has been crossed.
   * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
   *    particular target element or null if no previous entry exists.
   * @param {IntersectionObserverEntry} newEntry The current entry for a
   *    particular target element.
   * @return {boolean} Returns true if a any threshold has been crossed.
   * @private
   */
  IntersectionObserver.prototype._hasCrossedThreshold = function (oldEntry, newEntry) {

    // To make comparing easier, an entry that has a ratio of 0
    // but does not actually intersect is given a value of -1
    var oldRatio = oldEntry && oldEntry.isIntersecting ? oldEntry.intersectionRatio || 0 : -1;
    var newRatio = newEntry.isIntersecting ? newEntry.intersectionRatio || 0 : -1;

    // Ignore unchanged ratios
    if (oldRatio === newRatio) return;

    for (var i = 0; i < this.thresholds.length; i++) {
      var threshold = this.thresholds[i];

      // Return true if an entry matches a threshold or if the new ratio
      // and the old ratio are on the opposite sides of a threshold.
      if (threshold == oldRatio || threshold == newRatio || threshold < oldRatio !== threshold < newRatio) {
        return true;
      }
    }
  };

  /**
   * Returns whether or not the root element is an element and is in the DOM.
   * @return {boolean} True if the root element is an element and is in the DOM.
   * @private
   */
  IntersectionObserver.prototype._rootIsInDom = function () {
    return !this.root || docElement.contains(this.root);
  };

  /**
   * Returns whether or not the target element is a child of root.
   * @param {Element} target The target element to check.
   * @return {boolean} True if the target element is a child of root.
   * @private
   */
  IntersectionObserver.prototype._rootContainsTarget = function (target) {
    return (this.root || docElement).contains(target);
  };

  /**
   * Adds the instance to the global IntersectionObserver registry if it isn't
   * already present.
   * @private
   */
  IntersectionObserver.prototype._registerInstance = function () {
    if (registry.indexOf(this) < 0) {
      registry.push(this);
    }
  };

  /**
   * Removes the instance from the global IntersectionObserver registry.
   * @private
   */
  IntersectionObserver.prototype._unregisterInstance = function () {
    var index = registry.indexOf(this);
    if (index != -1) registry.splice(index, 1);
  };

  /**
   * Returns the result of the performance.now() method or null in browsers
   * that don't support the API.
   * @return {number} The elapsed time since the page was requested.
   */
  function now() {
    return window.performance && performance.now && performance.now();
  }

  /**
   * Throttles a function and delays its executiong, so it's only called at most
   * once within a given time period.
   * @param {Function} fn The function to throttle.
   * @param {number} timeout The amount of time that must pass before the
   *     function can be called again.
   * @return {Function} The throttled function.
   */
  function throttle(fn, timeout) {
    var timer = null;
    return function () {
      if (!timer) {
        timer = setTimeout(function () {
          fn();
          timer = null;
        }, timeout);
      }
    };
  }

  /**
   * Adds an event handler to a DOM node ensuring cross-browser compatibility.
   * @param {Node} node The DOM node to add the event handler to.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to add.
   * @param {boolean} opt_useCapture Optionally adds the even to the capture
   *     phase. Note: this only works in modern browsers.
   */
  function addEvent(node, event, fn, opt_useCapture) {
    if (typeof node.addEventListener == 'function') {
      node.addEventListener(event, fn, opt_useCapture || false);
    } else if (typeof node.attachEvent == 'function') {
      node.attachEvent('on' + event, fn);
    }
  }

  /**
   * Removes a previously added event handler from a DOM node.
   * @param {Node} node The DOM node to remove the event handler from.
   * @param {string} event The event name.
   * @param {Function} fn The event handler to remove.
   * @param {boolean} opt_useCapture If the event handler was added with this
   *     flag set to true, it should be set to true here in order to remove it.
   */
  function removeEvent(node, event, fn, opt_useCapture) {
    if (typeof node.removeEventListener == 'function') {
      node.removeEventListener(event, fn, opt_useCapture || false);
    } else if (typeof node.detatchEvent == 'function') {
      node.detatchEvent('on' + event, fn);
    }
  }

  /**
   * Returns the intersection between two rect objects.
   * @param {Object} rect1 The first rect.
   * @param {Object} rect2 The second rect.
   * @return {?Object} The intersection rect or undefined if no intersection
   *     is found.
   */
  function computeRectIntersection(rect1, rect2) {
    var top = Math.max(rect1.top, rect2.top);
    var bottom = Math.min(rect1.bottom, rect2.bottom);
    var left = Math.max(rect1.left, rect2.left);
    var right = Math.min(rect1.right, rect2.right);
    var width = right - left;
    var height = bottom - top;

    return width >= 0 && height >= 0 && {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      width: width,
      height: height
    };
  }

  /**
   * Shims the native getBoundingClientRect for compatibility with older IE.
   * @param {Element} el The element whose bounding rect to get.
   * @return {Object} The (possibly shimmed) rect of the element.
   */
  function getBoundingClientRect(el) {
    var rect = el.getBoundingClientRect();
    if (!rect) return;

    // Older IE
    if (!rect.width || !rect.height) {
      rect = {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    }
    return rect;
  }

  /**
   * Returns an empty rect object. An empty rect is returned when an element
   * is not in the DOM.
   * @return {Object} The empty rect.
   */
  function getEmptyRect() {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    };
  }

  // Exposes the constructors globally.
  window.IntersectionObserver = IntersectionObserver;
  window.IntersectionObserverEntry = IntersectionObserverEntry;
})(window, document);

/***/ }),
/* 5 */
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