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
export default function findRect (worker, ctx, width, height, options) {
  const imageData = ctx.getImageData(0, 0, width, height);

  const result = new Promise((resolve, reject) => {
    /* eslint-disable no-param-reassign */
    worker.onmessage = (e) => {
      resolve(e.data);
    };
    worker.onerror = reject;
    /* eslint-enable no-param-reassign */
  });

  worker.postMessage({
    imageData,
    options
  }, [imageData.data.buffer]);

  return result;
}
