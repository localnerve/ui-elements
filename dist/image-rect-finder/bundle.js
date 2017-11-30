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


var _phoneScene = __webpack_require__(1);

var _phoneScene2 = _interopRequireDefault(_phoneScene);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-enable import/no-unresolved */

window.addEventListener('DOMContentLoaded', function () {
  (0, _phoneScene2.default)({ image: document.querySelector('.image') });
}, {
  once: true
}); /**
     * App entry
     *
     * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
     * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
     */
/* global document, window */
/* eslint-disable import/no-unresolved */

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createScene;

var _findRect = __webpack_require__(2);

var _findRect2 = _interopRequireDefault(_findRect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-enable import/no-unresolved */

/**
 * Make sure the given urls are loaded, resolve to array of Images.
 *
 * @param {Array} urls - Array of image urls.
 * @returns {Promise} - Resolves to an array of loaded Images.
 */
function loadImgs(urls) {
  var remaining = urls.length;
  var imgs = void 0;

  return new Promise(function (resolve, reject) {
    function imgLoad() {
      if (! --remaining) {
        resolve(imgs);
      }
    }

    imgs = urls.map(function (url) {
      var img = new Image();
      img.onload = imgLoad;
      img.onerror = reject;
      img.crossOrigin = '';
      img.src = url;
      return img;
    });
  });
}

/**
 * Get background image url from the given element
 *
 * @param {HTMLElement} element - The html element.
 * @returns {String} The image url.
 */
/**
 * The phone scene test.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, Promise, Image, Worker */
/* eslint-disable import/no-unresolved */
function getBackgroundUrl(element) {
  var style = window.getComputedStyle(element);
  var bgImg = style.getPropertyValue('background-image');
  return bgImg.match(/url\(["']*([^"')]+)["']*\)/)[1];
}

/**
 * Draw the phone jpg with a missing, or "alpha", rect.
 *
 * @param {Worker} worker - The find-rect worker.
 * @param {HTMLElement} image - The html element to draw on.
 * @param {String} imageUrl - The url of the color image.
 * @returns {Promise} resolves or rejects on image load and find rect results.
 */
function drawPhone(worker, image, imageUrl) {
  var imageElement = image;

  return loadImgs([imageUrl]).then(function (imgs) {
    var colorImg = imgs[0];
    var canvas = document.createElement('canvas');
    var imageRect = imageElement.getBoundingClientRect();
    canvas.width = imageRect.width;
    canvas.height = imageRect.height;
    var ctx = canvas.getContext('2d');

    var scaleRevX = colorImg.naturalWidth / imageRect.width;
    var scaleRevY = colorImg.naturalHeight / imageRect.height;

    // Scale context to container element.
    ctx.scale(imageRect.width / colorImg.naturalWidth, imageRect.height / colorImg.naturalHeight);

    ctx.drawImage(colorImg, 0, 0);

    return (0, _findRect2.default)(worker, ctx, imageRect.width, imageRect.height, {
      shade: 0,
      candidateThreshold: 20,
      topLeft: {
        targetBlockMax: 10,
        edgeDiffMin: 38
      },
      bottomRight: {
        targetBlockMax: 12,
        edgeDiffMin: 38
      }
    }).then(function (rect) {
      console.log('foundRect', rect); // eslint-disable-line

      // Replace the color rect with "alpha"
      ctx.clearRect(rect.left * scaleRevX, rect.top * scaleRevY, rect.width * scaleRevX, rect.height * scaleRevY);

      // Subst the downloaded bg img with transparency,
      // append the modified canvas as the replacement image.
      imageElement.style.background = 'transparent';
      if (imageElement.hasChildNodes()) {
        imageElement.removeChild(imageElement.firstChild);
      }
      imageElement.appendChild(canvas);
    });
  });
}

/**
 * Create the phone scene.
 *
 * @param {Object} anonymous - scene options.
 * @param {HTMLElement} anonymous.image - color image.
 * @param {Number} anonymous.resizeWait - debouncing resize milliseconds.
 * @returns {Promise} resolves or rejects on drawPhone.
 */
function createScene(_ref) {
  var image = _ref.image,
      _ref$resizeWait = _ref.resizeWait,
      resizeWait = _ref$resizeWait === undefined ? 100 : _ref$resizeWait;

  var worker = new Worker('find-rect-worker.js');
  var imageUrl = getBackgroundUrl(image);

  var resizeTick = false;
  window.addEventListener('resize', function () {
    if (!resizeTick) {
      resizeTick = true;
      setTimeout(function () {
        drawPhone(worker, image, imageUrl).then(function () {
          resizeTick = false;
        }).catch(function (e) {
          console.error('drawPhone failed', e); // eslint-disable-line
          resizeTick = false;
        });
      }, resizeWait);
    }
  });

  return drawPhone(worker, image, imageUrl);
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findRect;
/**
 * Main thread interface to find-rect-worker.
 *
 * Copyright (c) 2017 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global Promise */

/**
 * Transfer the imageData to the worker and invoke the worker algo.
 *
 * @param {WebWorker} worker - The rect finding web worker.
 * @param {CanvasRenderingContext2D} ctx - The canvas context to search.
 * @param {Number} width - The image width.
 * @param {Number} height - The image height.
 * @param {Object} options - algorithm options.
 * @returns {Promise} Resolves to found rect.
 */
function findRect(worker, ctx, width, height, options) {
  var imageData = ctx.getImageData(0, 0, width, height);

  var result = new Promise(function (resolve, reject) {
    /* eslint-disable no-param-reassign */
    worker.onmessage = function (e) {
      resolve(e.data);
    };
    worker.onerror = reject;
    /* eslint-enable no-param-reassign */
  });

  worker.postMessage({
    imageData: imageData,
    options: options
  }, [imageData.data.buffer]);

  return result;
}

/***/ })
/******/ ]);