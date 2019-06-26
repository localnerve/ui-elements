/**
 * The phone scene test.
 *
 * Copyright (c) 2017-2019 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* global window, document, Image, Worker */
/* eslint-disable import/no-unresolved */
import findRect from './find-rect';
/* eslint-enable import/no-unresolved */

/**
 * Make sure the given urls are loaded, resolve to array of Images.
 *
 * @param {Array} urls - Array of image urls.
 * @returns {Promise} - Resolves to an array of loaded Images.
 */
function loadImgs (urls) {
  let remaining = urls.length;
  let imgs;

  return new Promise((resolve, reject) => {
    function imgLoad () {
      if (!--remaining) {
        resolve(imgs);
      }
    }

    imgs = urls.map((url) => {
      const img = new Image();
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
function getBackgroundUrl (element) {
  const style = window.getComputedStyle(element);
  const bgImg = style.getPropertyValue('background-image');
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
function drawPhone (worker, image, imageUrl) {
  const imageElement = image;

  return loadImgs([imageUrl]).then((imgs) => {
    const colorImg = imgs[0];
    const canvas = document.createElement('canvas');
    const imageRect = imageElement.getBoundingClientRect();
    canvas.width = imageRect.width;
    canvas.height = imageRect.height;
    const ctx = canvas.getContext('2d');

    const scaleRevX = colorImg.naturalWidth / imageRect.width;
    const scaleRevY = colorImg.naturalHeight / imageRect.height;

    // Scale context to container element.
    ctx.scale(
      imageRect.width / colorImg.naturalWidth,
      imageRect.height / colorImg.naturalHeight
    );

    ctx.drawImage(colorImg, 0, 0);

    return findRect(worker, ctx, imageRect.width, imageRect.height, {
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
    }).then((rect) => {
      console.log('foundRect', rect); // eslint-disable-line

      // Replace the color rect with "alpha"
      ctx.clearRect(
        rect.left * scaleRevX, rect.top * scaleRevY,
        rect.width * scaleRevX, rect.height * scaleRevY
      );

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
export default function createScene ({ image, resizeWait = 100 }) {
  const worker = new Worker('find-rect-worker.js');
  const imageUrl = getBackgroundUrl(image);

  let resizeTick = false;
  window.addEventListener('resize', () => {
    if (!resizeTick) {
      resizeTick = true;
      setTimeout(() => {
        drawPhone(worker, image, imageUrl)
          .then(() => {
            resizeTick = false;
          })
          .catch((e) => {
            console.error('drawPhone failed', e); // eslint-disable-line
            resizeTick = false;
          });
      }, resizeWait);
    }
  });

  return drawPhone(worker, image, imageUrl);
}
