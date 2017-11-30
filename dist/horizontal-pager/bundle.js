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


var _horizontalPager = __webpack_require__(1);

var _horizontalPager2 = _interopRequireDefault(_horizontalPager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * HorizontalPager callback to update the page indicator bubbles.
 *
 * @param {Object} A moveResult object.
 */
function updateBubble(moveResult) {
  var distance = moveResult.distance;

  var selectedBbl = document.querySelector('.bbl.selected');
  var firstBbl = document.querySelector('.bbl:first-child');
  var lastBbl = document.querySelector('.bbl:last-child');
  var sibling = selectedBbl;
  var dist = distance;

  while (distance > 0 ? dist-- : dist++) {
    sibling = distance > 0 ? sibling.nextElementSibling || firstBbl : sibling.previousElementSibling || lastBbl;
  }

  selectedBbl.classList.remove('selected');
  sibling.classList.add('selected');
} /**
   * Entry point to horizontal-pager example.
   *
   * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
   * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
   */
/* global window, document */
/* eslint-disable import/no-unresolved */


document.addEventListener('DOMContentLoaded', function () {
  var horizontalPager = (0, _horizontalPager2.default)({
    targetClass: 'page-item',
    willComplete: updateBubble,
    continuous: true
  });
  // Create a global to expose the API.
  window.horizontalPager = horizontalPager;
}, {
  once: true
});

document.addEventListener('unload', function () {
  return window.horizontalPager && window.horizontalPager.destroy();
}, { once: true });

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * horizontal-pager
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * A small, fast, no-dep, horizontal pager.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
/* global Promise, document, setTimeout, requestAnimationFrame, cancelAnimationFrame */

/* eslint-disable import/no-unresolved */


exports.default = createHorizontalPager;

var _passiveEvent = __webpack_require__(2);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-enable import/no-unresolved */

var HorizontalPager = function () {
  /**
   * HorizontalPager constructor.
   * @public
   *
   * @param {Object} options - HorizontalScroller options.
   * @param {String} options.targetClass - The class that identifies the scroll
   * target. Must be supplied.
   * @param {Number} [options.startIndex] - Which scroll target to show initially.
   * Defaults to 0.
   * @param {Number} [options.scrollThreshold] - Less than 1, a decimal
   * percentage beyond which a touch will cause a complete scroll.
   * Defaults to 0.35.
   * @param {Number} [options.doneThreshold] - The translateX pixel value below
   * which to stop animations. Defaults to 1 (Will not animate below 1px).
   * @param {Function} [options.done] - A function to call after a scroll has
   * completed.
   * @param {Function} [options.willComplete] - A function to call when a scroll
   * will complete very soon.
   * @param {Boolean} [options.continuous] - True allows the ends to wrap around.
   * Defaults to false.
   * @param {Boolean} [options.addParentStyles] - False disables the adding
   * of styles to the parent of targetClass elements. Defaults to true.
   */
  function HorizontalPager(options) {
    _classCallCheck(this, HorizontalPager);

    var noop = function noop() {};

    this.opts = Object.assign({}, {
      targetClass: '',
      startIndex: 0,
      doneThreshold: 1,
      scrollThreshold: 0.35,
      continuous: false,
      addParentStyles: true
    }, options);

    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);

    this.notifyWillComplete = typeof this.opts.willComplete === 'function' ? setTimeout.bind(null, this.opts.willComplete, 0) : noop;
    this.notifyDone = typeof this.opts.done === 'function' ? setTimeout.bind(null, this.opts.done, 0) : noop;

    this.lastTargetIndex = this.opts.startIndex;
    this.targetIndex = this.opts.startIndex;
    this.dataId = 'data-hpid';
    this.targetWidth = 0;
    this.target = null;
    this.nextSib = null;
    this.prevSib = null;
    this.touching = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.translateX = 0;
    this.targetX = 0;
    this.atEdge = false;
    this.animating = false;
    this.willCompleteOnce = false;
    this.isVertical = undefined;
    this.targets = [];
    this.rafs = [];

    if (this.setupTargets() > 1) {
      this.addEventListeners();
    }

    // Special case flag, if continuous and two slides:
    this.continuousTwo = this.targets.length === 2 && this.opts.continuous;
  }

  /**
   * Wireup events.
   * @private
   */


  _createClass(HorizontalPager, [{
    key: 'addEventListeners',
    value: function addEventListeners() {
      var options = (0, _passiveEvent.createPassiveEventHandlerOption)();

      document.addEventListener('touchstart', this.onStart, options);
      document.addEventListener('touchmove', this.onMove, options);
      document.addEventListener('touchend', this.onEnd, options);
    }

    /**
     * Setup the scroll targets (pages).
     * @private
     *
     * @returns {Number} The number of scroll targets found.
     */

  }, {
    key: 'setupTargets',
    value: function setupTargets() {
      var parentStyle = {
        position: 'relative',
        width: '100%',
        'overflow-x': 'hidden'
      };
      var parents = [];
      var _opts = this.opts,
          targetClass = _opts.targetClass,
          startIndex = _opts.startIndex,
          addParentStyles = _opts.addParentStyles;


      this.targets = document.querySelectorAll('.' + targetClass);

      for (var i = 0; i < this.targets.length; i++) {
        if (addParentStyles) {
          var parent = this.targets[i].parentElement;
          if (!parents.includes(parent)) {
            parents.push(parent);
          }
        }

        this.targets[i].setAttribute(this.dataId, i);

        if (i !== startIndex) {
          this.targets[i].setAttribute('aria-hidden', true);
        }

        var style = this.targets[i].style;

        style.position = i === startIndex ? 'static' : 'absolute';
        style.transform = 'translate3d(' + (i - startIndex) * 100 + '%, 0px, 0px)';
        style.display = 'block';
        style.top = 0;
        style.left = 0;
        style.width = '100%';
      }

      if (parents.length === 1) {
        Object.assign(parents[0].style, parentStyle);
      } else if (parents.length > 1) {
        /* eslint-disable no-console */
        console.error('horizontal-pager: \'.' + targetClass + '\' elements MUST be siblings.');
        /* eslint-enable no-console */
      }

      return this.targets.length;
    }

    /**
     * Cancel any pending animation frames and reset styles if will not complete.
     * Does not touch nextTarget, rather, the previous target items in `this`.
     * Presumes nextTarget will be updated after this.
     * @private
     *
     * @param {Object} [newTarget] - The new, next target for paging.
     * If supplied, directs style resets to happen. Will not reset styles for
     * the next target.
     */

  }, {
    key: 'resetAnimations',
    value: function resetAnimations(newTarget) {
      this.rafs.forEach(function (raf) {
        return cancelAnimationFrame(raf);
      });
      this.rafs.length = 0;

      if (newTarget) {
        var _touchStatus = this.touchStatus(),
            willComplete = _touchStatus.willComplete;

        if (!willComplete) {
          var newId = newTarget.getAttribute(this.dataId);
          var resetStyle = {
            position: 'absolute',
            willChange: 'initial'
          };

          var nextStyle = this.nextSib && this.nextSib.getAttribute(this.dataId) !== newId ? this.nextSib.style : {};
          var prevStyle = this.prevSib && this.prevSib.getAttribute(this.dataId) !== newId ? this.prevSib.style : {};
          var targetStyle = this.target && this.target.getAttribute(this.dataId) !== newId ? this.target.style : {};

          Object.assign(nextStyle, resetStyle);
          Object.assign(prevStyle, resetStyle);
          Object.assign(targetStyle, resetStyle);
        }
      }
    }

    /**
     * If animation done, complete it and signal done.
     * @private
     *
     * @param {Boolean} targetDone - True if the scroll target is done, false otherwise.
     * @param {Boolean} nextDone - True if the next page is done, false otherwise.
     * @param {Boolean} prevDone - True if the prev page is done, false otherwise.
     * @param {Boolean} [styleOnly] - True if only update styles.
     */

  }, {
    key: 'completeAnimations',
    value: function completeAnimations(targetDone, nextDone, prevDone, styleOnly) {
      if (nextDone || prevDone) {
        var nextStyle = this.nextSib ? this.nextSib.style : {};
        var prevStyle = this.prevSib ? this.prevSib.style : {};

        this.target.style.position = 'absolute';
        this.target.style.willChange = 'initial';
        this.target.setAttribute('aria-hidden', true);

        if (nextDone) {
          nextStyle.position = 'static';
          prevStyle.willChange = 'initial';
          this.nextSib.removeAttribute('aria-hidden');
        } else {
          prevStyle.position = 'static';
          nextStyle.willChange = 'initial';
          this.prevSib.removeAttribute('aria-hidden');
        }

        if (!styleOnly) {
          this.notifyDone(this.createMoveResult());
        }
      }

      if (!styleOnly && (targetDone || nextDone || prevDone)) {
        this.target = null;
      }
    }

    /**
     * Create percentage translateX value.
     * If done, make sure the value is off by 100% magnitude.
     * NOTE: This presumes all targets are the same width.
     * @private
     *
     * @param {Boolean} done - True if done, and adjustment required.
     * Otherwise, pass the value through.
     * @param {Number} value - The value to adjust, if required.
     */

  }, {
    key: 'transX',
    value: function transX(done, value) {
      if (done && Math.abs(value) < this.targetWidth) {
        return 100 * (value < 0 ? -1 : 1);
      }
      return value / this.targetWidth * 100;
    }

    /**
     * Get the touch status by calculating the current translateX
     * progress and comparing against the threshold of `completeness`.
     * Also calculates direction.
     * @private
     *
     * @returns {Object} contains two booleans: willComplete and movingLeft.
     */

  }, {
    key: 'touchStatus',
    value: function touchStatus() {
      var threshold = this.targetWidth * this.opts.scrollThreshold;
      var translateX = this.currentX - this.startX;

      return {
        willComplete: Math.abs(translateX) > threshold && !this.atEdge,
        movingLeft: translateX > 0 // true if moving left to prev, swiping right.
      };
    }

    /**
     * Get the next sibling of the given target that has the targetClass.
     * @private
     *
     * @param {Object} target - The HTMLElement to evaluate.
     * @returns {Object} The nextElementSibling or null if none found.
     */

  }, {
    key: 'getNextSibling',
    value: function getNextSibling(target) {
      var targetClass = this.opts.targetClass;

      var nextSib = target.nextElementSibling;
      var nextOk = nextSib && nextSib.classList.contains(targetClass);

      if (!nextOk && this.opts.continuous) {
        /* eslint-disable prefer-destructuring */
        nextSib = this.targets[0];
        /* eslint-enable prefer-destructuring */
        nextOk = true;
      }

      return nextOk ? nextSib : null;
    }

    /**
     * Get the previous sibling of the given target that has the targetClass.
     * @private
     *
     * @param {Object} target - The HTMLElement to evaluate.
     * @returns {Object} The previousElementSibling or null if none found.
     */

  }, {
    key: 'getPrevSibling',
    value: function getPrevSibling(target) {
      var targetClass = this.opts.targetClass;

      var prevSib = target.previousElementSibling;
      var prevOk = prevSib && prevSib.classList.contains(targetClass);

      if (!prevOk && this.opts.continuous) {
        prevSib = this.targets[this.targets.length - 1];
        prevOk = true;
      }

      return prevOk ? prevSib : null;
    }

    /**
     * Create a moveResult object.
     * Call after updateTargetIndex, use to deliver moveResult to callbacks.
     * @private
     *
     * @returns {Object} A moveResult Object with
     *   currTargetIndex, prevTargetIndex, and distance.
     */

  }, {
    key: 'createMoveResult',
    value: function createMoveResult() {
      return {
        currTargetIndex: this.targetIndex,
        prevTargetIndex: this.lastTargetIndex,
        distance: this.targetDistance
      };
    }

    /**
     * Given a distance (-1, +1), calculate and update the next target index.
     * Works in continuous mode or not.
     * Updates this.lastTargetIndex, this.targetDistance, this.targetIndex.
     * @private
     *
     * @param {Number} distance - The distance to calc from the current index.
     */

  }, {
    key: 'updateTargetIndex',
    value: function updateTargetIndex(distance) {
      this.lastTargetIndex = this.targetIndex;
      this.targetDistance = distance;
      var length = this.targets.length;

      var nextIndex = this.targetIndex + distance;
      var nextTargetIndex = (length + nextIndex % length) % length;
      this.targetIndex = nextTargetIndex;
    }

    /**
     * Get PageX value, support multiple event interfaces.
     *
     * @param {Object} evt - A Touch Event
     * @returns {Number} The page X value.
     */

  }, {
    key: 'onStart',


    /**
     * touchstart handler, passive.
     * Gets called once per touch (two fingers = two calls), but limits to first.
     * @private
     *
     * @param {Object} evt - The TouchEvent object.
     */
    value: function onStart(evt) {
      if (this.touching || this.animating) {
        return;
      }

      var newTarget = this.targets[this.targetIndex];

      this.targetWidth = newTarget.getBoundingClientRect().width;
      this.startX = HorizontalPager.getPageX(evt);
      this.startY = HorizontalPager.getPageY(evt);
      this.currentX = this.startX;

      this.resetAnimations(newTarget);

      this.target = newTarget;
      this.nextSib = this.getNextSibling(newTarget);
      this.prevSib = this.getPrevSibling(newTarget);

      this.touching = true;
      this.willCompleteOnce = false;
      this.isVertical = undefined;
      this.atEdge = false;

      this.target.style.willChange = 'transform';
      this.target.style.position = 'static';

      if (this.nextSib) {
        this.nextSib.style.willChange = 'transform';
      }
      if (this.prevSib) {
        this.prevSib.style.willChange = 'transform';
      }

      this.rafs.push(requestAnimationFrame(this.update));
    }

    /**
     * touchmove handler, passive.
     * Gets called tons.
     * Heavy lifting moved to RAF handler `update`.
     * Sets this.currentX. Sets this.isVertical once per touch (limited to one).
     * @private
     *
     * @param {Object} evt - The TouchEvent object.
     */

  }, {
    key: 'onMove',
    value: function onMove(evt) {
      this.currentX = HorizontalPager.getPageX(evt);

      if (typeof this.isVertical === 'undefined') {
        this.isVertical = Math.abs(this.currentX - this.startX) < Math.abs(HorizontalPager.getPageY(evt) - this.startY);
      }

      if (this.isVertical) {
        this.currentX = this.startX;
      }
    }

    /**
     * touchend handler, passive.
     * Gets called once per touch (two fingers = two calls), but limits to first.
     * @private
     */

  }, {
    key: 'onEnd',
    value: function onEnd() {
      if (!this.touching) {
        return;
      }
      this.touching = false;

      var _touchStatus2 = this.touchStatus(),
          willComplete = _touchStatus2.willComplete,
          movingLeft = _touchStatus2.movingLeft;

      this.targetX = 0;

      if (willComplete) {
        this.targetX = movingLeft ? this.targetWidth : -this.targetWidth;

        if (!this.willCompleteOnce) {
          this.willCompleteOnce = true;
          var direction = movingLeft ? -1 : 1;
          this.updateTargetIndex(direction);
          this.notifyWillComplete(this.createMoveResult());
        }
      }
    }

    /**
     * The animation frame handler.
     * @private
     */

  }, {
    key: 'update',
    value: function update(complete) {
      if (!this.target) {
        return;
      }

      this.rafs.push(requestAnimationFrame(this.update.bind(this, complete)));

      // Calc translateX units. If not touching, ease out.
      if (this.touching) {
        this.translateX = this.currentX - this.startX;

        if (!this.opts.continuous) {
          // Detect edge, add resistance and limit
          this.atEdge = !this.prevSib && this.translateX > 0 || !this.nextSib && this.translateX < 0;
          if (this.atEdge) {
            this.translateX = this.translateX / (Math.abs(this.translateX) / this.targetWidth + 1);
          }
        }
      } else {
        this.translateX += (this.targetX - this.translateX) / 4;
      }
      var skipNext = this.continuousTwo && this.translateX > 0;
      var skipPrev = this.continuousTwo && this.translateX < 0;
      var nextX = (this.translateX + this.targetWidth).toFixed(6);
      var prevX = (this.translateX - this.targetWidth).toFixed(6);

      // Detect animation done
      var targetDone = this.isVertical || !this.touching && Math.abs(this.translateX) < this.opts.doneThreshold;
      var nextDone = Math.abs(nextX) < this.opts.doneThreshold;
      var prevDone = Math.abs(prevX) < this.opts.doneThreshold;

      // Update transform translateX
      this.target.style.transform = 'translateX(' + (targetDone ? 0 : this.transX(nextDone || prevDone, this.translateX)) + '%)';
      if (this.nextSib && !skipNext) {
        this.nextSib.style.transform = 'translateX(' + (nextDone ? 0 : this.transX(targetDone, nextX)) + '%)';
      }
      if (this.prevSib && !skipPrev) {
        this.prevSib.style.transform = 'translateX(' + (prevDone ? 0 : this.transX(targetDone, prevX)) + '%)';
      }

      // Complete
      if (typeof complete === 'function') {
        complete(targetDone, nextDone, prevDone);
      } else {
        this.completeAnimations(targetDone, nextDone, prevDone);
      }
    }

    /**
     * Schedule scroll animation without touch.
     * @private
     *
     * @param {Number} distance - The value determines the number of targets to
     * animate ahead (or behind) to. The sign determines the direction, positive
     * is next, negative is prev.
     * @returns {Boolean} true if animation occurred, false otherwise.
     */

  }, {
    key: 'animate',
    value: function animate(distance) {
      var _this = this;

      var moveNext = distance > 0;
      var edgeCheck = true;
      var rangeCheck = void 0;

      if (this.opts.continuous) {
        rangeCheck = Math.abs(distance) <= this.targets.length;
      } else {
        rangeCheck = this.targetIndex + distance >= 0 && this.targetIndex + distance <= this.targets.length - 1;
        edgeCheck = moveNext ? this.targetIndex < this.targets.length - 1 : this.targetIndex > 0;
      }

      var canAnimate = distance && rangeCheck && edgeCheck && !this.animating;

      if (canAnimate) {
        return new Promise(function (resolve) {
          _this.animating = true;
          _this.target = null;
          _this.resetAnimations();

          var fullWidth = void 0;
          var originalWidth = void 0;
          var lastWidthCount = void 0;

          requestAnimationFrame(function () {
            _this.target = _this.targets[_this.targetIndex];
            _this.targetWidth = _this.target.getBoundingClientRect().width;
            _this.prevSib = _this.getPrevSibling(_this.target);
            _this.nextSib = _this.getNextSibling(_this.target);

            _this.currentX = _this.currentX || 0;
            _this.startX = _this.currentX;
            _this.translateX = _this.currentX - _this.startX;
            _this.targetX = _this.targetWidth * distance * -1;
            _this.touching = false;

            lastWidthCount = 0;
            originalWidth = _this.targetWidth;
            fullWidth = _this.targetWidth * Math.abs(distance);

            _this.updateTargetIndex(distance);
            _this.notifyWillComplete(_this.createMoveResult());

            if (Math.abs(distance) === 1) {
              _this.rafs.push(requestAnimationFrame(_this.update.bind(_this, function () {
                for (var _len = arguments.length, doneFlags = Array(_len), _key = 0; _key < _len; _key++) {
                  doneFlags[_key] = arguments[_key];
                }

                _this.completeAnimations.apply(_this, doneFlags);
                if (doneFlags.includes(true)) {
                  _this.animating = false;
                  resolve(_this.createMoveResult());
                }
              })));
            } else {
              _this.rafs.push(requestAnimationFrame(_this.update.bind(_this, function () {
                var widthCount = Math.trunc(Math.abs(_this.translateX) / originalWidth);
                var diff = fullWidth - Math.abs(_this.translateX);

                if (diff < _this.opts.doneThreshold) {
                  _this.completeAnimations(false, moveNext, !moveNext);
                  _this.animating = false;
                  resolve(_this.createMoveResult());
                } else if (widthCount - lastWidthCount > 0) {
                  lastWidthCount = widthCount;

                  _this.completeAnimations(false, moveNext, !moveNext, true);

                  _this.targetWidth += originalWidth;

                  if (moveNext) {
                    _this.prevSib = _this.target;
                    _this.target = _this.nextSib;
                    _this.nextSib = _this.getNextSibling(_this.target);
                  } else {
                    _this.nextSib = _this.target;
                    _this.target = _this.prevSib;
                    _this.prevSib = _this.getPrevSibling(_this.target);
                  }
                }
              })));
            }
          });
        });
      }
      return Promise.resolve(null);
    }

    /**
     * Move to the next targetClass (page).
     * If at the end, does nothing.
     * @public
     *
     * @returns {Boolean} true if animation occurred, false otherwise.
     */

  }, {
    key: 'moveNext',
    value: function moveNext() {
      return this.animate(1);
    }

    /**
     * Move to the previous targetClass (page).
     * If at the beginning, does nothing.
     * @public
     *
     * @returns {Boolean} true if animation occurred, false otherwise.
     */

  }, {
    key: 'movePrev',
    value: function movePrev() {
      return this.animate(-1);
    }

    /**
     * Move N from current targetClass (page).
     * @public
     *
     * @param {Number} distance - The number of pages to move forward (+) or back (-)
     * @returns {Boolean} true if animation occurred, false otherwise.
     */

  }, {
    key: 'moveRel',
    value: function moveRel(distance) {
      return this.animate(distance);
    }

    /**
     * Move to the Nth targetClass (page).
     * @public
     *
     * @param {Number} index - The zero-based index to move to.
     * @returns {Boolean} true if animation occurred, false otherwise.
     */

  }, {
    key: 'moveAbs',
    value: function moveAbs(index) {
      return this.animate(index - this.targetIndex);
    }

    /**
     * @public
     * @returns {Number} The number of targetClass targets.
     */

  }, {
    key: 'getTargetCount',
    value: function getTargetCount() {
      return this.targets.length;
    }

    /**
     * @public
     * @returns {Number} The current target index.
     */

  }, {
    key: 'getTargetIndex',
    value: function getTargetIndex() {
      return this.targetIndex;
    }

    /**
     * @public
     * @returns {Number} The last (previous) target index.
     */

  }, {
    key: 'getPrevTargetIndex',
    value: function getPrevTargetIndex() {
      return this.lastTargetIndex;
    }

    /**
     * Call to stop animations and events.
     * Requires browser.
     * @public
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.resetAnimations();
      document.removeEventListener('touchstart', this.onStart);
      document.removeEventListener('touchmove', this.onMove);
      document.removeEventListener('touchend', this.onEnd);
    }
  }], [{
    key: 'getPageX',
    value: function getPageX(evt) {
      var result = 0;
      var hasPageX = typeof evt.pageX !== 'undefined';

      if (hasPageX) {
        result = evt.pageX;
      } else {
        var hasTouches = typeof evt.touches !== 'undefined';
        if (hasTouches && evt.touches.length > 0) {
          result = evt.touches[0].pageX;
        }
      }

      return result;
    }

    /**
     * Get PageY value, support multiple event interfaces.
     *
     * @param {Object} evt - A Touch Event
     * @returns {Number} The page Y value.
     */

  }, {
    key: 'getPageY',
    value: function getPageY(evt) {
      var result = 0;
      var hasPageY = typeof evt.pageY !== 'undefined';

      if (hasPageY) {
        result = evt.pageY;
      } else {
        var hasTouches = typeof evt.touches !== 'undefined';
        if (hasTouches && evt.touches.length > 0) {
          result = evt.touches[0].pageY;
        }
      }

      return result;
    }
  }]);

  return HorizontalPager;
}();

/**
 * Create the public interface for HorizontalPager.
 * @see HorizontalPager constructor for options details.
 *
 * @param {Object} options - HorizontalPager options.
 * @param {String} options.targetClass - classname to identify pager targets.
 * @returns {Object} The public interface for HorizontalPager.
 */


function createHorizontalPager(options) {
  var horizontalPager = new HorizontalPager(options);

  return {
    destroy: horizontalPager.destroy.bind(horizontalPager),
    next: horizontalPager.moveNext.bind(horizontalPager),
    prev: horizontalPager.movePrev.bind(horizontalPager),
    moveRel: horizontalPager.moveRel.bind(horizontalPager),
    moveAbs: horizontalPager.moveAbs.bind(horizontalPager),
    targetCount: horizontalPager.getTargetCount.bind(horizontalPager),
    currTargetIndex: horizontalPager.getTargetIndex.bind(horizontalPager),
    prevTargetIndex: horizontalPager.getPrevTargetIndex.bind(horizontalPager)
  };
}

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