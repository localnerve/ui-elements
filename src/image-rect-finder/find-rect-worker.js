/**
 * Worker to find a solid shaded rectangle.
 *
 * Copyright (c) 2017-2022 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
/* eslint-env worker */
/* global */

/**
 * Get average color value from r, g, b at data[i].
 * The average byte value from r,g,b will be greyscale,
 * showing lightness/darkness. Assumes rgba, Ignores alpha bytes.
 *
 * @param {Array} data - The rgba bytes.
 * @param {Number} i - The index to the bytes to inspect.
 * @returns {Number} - The average 8-bit value from r,g,b at data[i].
 */
function getGrey (data, i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return (r + g + b) / 3;
}

/**
 * Tests average rgb color values at data[i] against the given 8-bit color (grey),
 * within a threshold.
 *
 * @param {Number} grey - The 8-bit value (grey) to be tested for (0-255).
 * @param {Array} data - The rgba bytes.
 * @param {Number} i - The index to start testing at in the rgba array.
 * @param {Number} thres - The difference of the average from the given 8-bit
 * value that is acceptable. Within the threshold counts as the value.
 */
function nearGrey (grey, data, i, thres = 6) {
  const diff = grey - getGrey(data, i);
  const result = diff <= thres && diff >= -thres;
  return result;
}

/**
 * Test in a vertical shape for shade difference.
 *
 * @param {Number} rowOffset - Offset to the next row, signed for direction.
 * @param {Number} pOffset - Offset to the next pixel, signed for direction.
 * @param {Array} data - The rgba byte array.
 * @param {Number} i - The index to test around.
 * @param {Object} options - Specific options.
 * @param {Number} options.shade - The 8-bit grey value to test against.
 * @param {Number} options.diffMin - The minimum shade difference that means pass.
 * @returns {Boolean} true if pass, false otherwise.
 */
function verticalTest (rowOffset, pOffset, data, i, options) {
  const { shade, diffMin } = options;

  const v0 = getGrey(data, i + rowOffset);
  const v1 = getGrey(data, i + (2 * rowOffset));
  const v2 = getGrey(data, i + (rowOffset - pOffset));
  const v3 = getGrey(data, i + ((2 * rowOffset) - pOffset));
  const v4 = getGrey(data, i + (rowOffset - (2 * pOffset)));
  const v5 = getGrey(data, i + ((2 * rowOffset) - (2 * pOffset)));

  const verticalBlock = (v0 + v1 + v2 + v3 + v4 + v5) / 6;
  const verticalDiff = shade - verticalBlock;
  const result = verticalDiff >= diffMin || verticalDiff <= -diffMin;

  return result;
}

/**
 * Test in a horizontal shape for shade difference.
 *
 * @param {Number} rowOffset - Offset to the next row, signed for direction.
 * @param {Number} pOffset - Offset to the next pixel, signed for direction.
 * @param {Array} data - The rgba byte array.
 * @param {Number} i - The index to test around.
 * @param {Object} options - Specific options.
 * @param {Number} options.shade - The 8-bit grey value to test against.
 * @param {Number} options.diffMin - The minimum shade difference that means pass.
 * @returns {Boolean} true if pass, false otherwise.
 */
function horizontalTest (rowOffset, pOffset, data, i, options) {
  const { shade, diffMin } = options;

  const h0 = getGrey(data, i + pOffset);
  const h1 = getGrey(data, i + (2 * pOffset));
  const h2 = getGrey(data, (i - rowOffset) + pOffset);
  const h3 = getGrey(data, (i - rowOffset) + (2 * pOffset));
  const h4 = getGrey(data, i - ((2 * rowOffset) + pOffset));
  const h5 = getGrey(data, i - ((2 * rowOffset) + (2 * pOffset)));

  const horizontalBlock = (h0 + h1 + h2 + h3 + h4 + h5) / 6;
  const horizontalDiff = shade - horizontalBlock;
  const result = horizontalDiff >= diffMin || horizontalDiff <= -diffMin;

  return result;
}

/**
 * Test to determine top-left or right-bottom corner.
 * Algo summary:
 *  1. Check 6 pixel average around the target, data[i], is within blockMax.
 *  2. Check 6 pixel average in the vertical (up or down) direction is a greater
 *     difference than diffMin. 6 pixels = (2 rows x 3 cols)
 *  3. Check 6 pixel average in the horizontal (left or right) direction is a
 *     greater difference than diffMin. 6 pixels = (3 rows x 2 cols)
 *  4. If 1, 2, and 3 pass, then corner is true - false otherwise.
 *
 * @param {Boolean} tl - True for top-left corner test, false for bottom-right.
 * @param {Number} shade - The 8 bit greyscale color value (0-255) to test for.
 * @param {Number} bpp - Bytes per pixel.
 * @param {Number} width - The width in pixels of the image.
 * @param {Array} data - The reference to all the color bytes.
 * @param {Number} i - The target index to test for.
 * @param {Object} thresholds - Thresholds for the algorithm operation.
 * @param {Number} thresholds.targetBlockMax - The max diff of the target
 * area from the given shade allowed.
 * @param {Number} thresholds.edgeDiffMin - The min diff of the edges from
 * the given shade that must occur to define 'edge-ness'.
 * @returns {Boolean} true if corner found, false otherwise.
 */
function cornerTest (tl, shade, bpp, width, data, i, thresholds) {
  let result = false;

  const { targetBlockMax: blockMax, edgeDiffMin: diffMin } = thresholds;

  const mult = tl ? -1 : 1;
  const tests = tl ? [verticalTest, horizontalTest] : [horizontalTest, verticalTest];
  const pOffset = bpp * mult;
  const rowOffset = width * bpp * mult;

  const t0 = getGrey(data, i);
  const t1 = getGrey(data, i - pOffset);
  const t2 = getGrey(data, i - rowOffset);
  const t3 = getGrey(data, i - rowOffset - pOffset);
  const t4 = getGrey(data, i - (2 * rowOffset));
  const t5 = getGrey(data, i - (2 * rowOffset) - pOffset);

  const targetBlock = (t0 + t1 + t2 + t3 + t4 + t5) / 6;
  const targetDiff = shade - targetBlock;
  const targetResult = targetDiff <= blockMax && targetDiff >= -blockMax;

  if (targetResult) {
    result = tests.every(test => test(rowOffset, pOffset, data, i, {
      shade,
      diffMin
    }));
  }

  return result;
}

/**
 * Simple Top-left, bottom-right corner discovery to find a corner of a color
 * rectangle in an array of pixels.
 *
 * Tests the main subject pixel (data[i]), then checks adjacent pixels
 * for confirmation of top-leftness or bottom-rightness.
 *
 * @param {Boolean} tl - Find top-left if true, otherwise find bottom-right.
 * @param {Object} options - Algorithm operational options.
 * @param {Number} options.shade - The 8-bit greyscale color of the rectangle
 * to find.
 * @param {Number} options.candidateThreshold - Shade difference under which a
 * pixel is a considered a candidate.
 * @param {Object} options.topLeft - options for top-left corner.
 * @param {Number} options.topLeft.targetBlockMax - top-left: Shade difference
 * under which a block of pixels (6) around a candidate are considered a solid
 * block.
 * @param {Number} options.topLeft.edgeDiffMin - top-left: Shade difference
 * over which a block of pixels (6) adjacent to a candidate are considered an
 * edge.
 * @param {Object} options.bottomRight - options for bottom-right corner.
 * @param {Number} options.bottomRight.targetBlockMax - bottom-right: Shade
 * difference under which a block of pixels (6) around a candidate are
 * considered a solid block.
 * @param {Number} options.bottomRight.edgeDiffMin - bottom-right: Shade
 * difference over which a block of pixels (6) adjacent to a candidate are
 * considered an edge.
 * @param {Number} bytesPerPixel - The number of bytes per pixel.
 * @param {Number} width - The width (in pixels) of the image.
 * @param {Array} data - Array of bytes containing the color values.
 * @param {Number} i - The index to examine.
 * @returns {Boolean} true if found, false otherwise.
 */
function findCorner (tl, options, bytesPerPixel, width, data, i) {
  let found = false;

  if (nearGrey(options.shade, data, i, options.candidateThreshold)) {
    const thresholds = tl ? 'topLeft' : 'bottomRight';

    found = cornerTest(
      tl, options.shade, bytesPerPixel, width, data, i, options[thresholds]
    );
  }

  return found;
}

/**
 * Find the first rectangle of the given 8-bit color value.
 * Uses simple inspection (average of averages) of surrounding blocks
 * to find targets (same-ness) and edges (differences) to detect corners.
 * Blind to rects in the first two rows (starts two rows down).
 * Blind to rects that end in the last two rows (ends two rows up).
 *
 * @param {ImageData} imageData - The ImageData to search.
 * @param {Object} options - algorithm options.
 * @returns {Object} A simplified Rect object with top, left, width, and height
 * properties.
 */
function findFirstRect (imageData, options) {
  const total = imageData.width * imageData.height;
  const { data } = imageData;
  const bytesPerPixel = data.length / total;

  // start two rows down, two pixels over.
  const start = (imageData.width * bytesPerPixel * 2) + (2 * bytesPerPixel);
  // end two rows up, two pixels less.
  const end = (total * bytesPerPixel)
    - (2 * imageData.width * bytesPerPixel)
    - (2 * bytesPerPixel);

  const tlPad = 2;
  const brPad = tlPad * 2;

  const topLeft = findCorner.bind(
    null, true, options, bytesPerPixel, imageData.width, data
  );
  const botRight = findCorner.bind(
    null, false, options, bytesPerPixel, imageData.width, data
  );

  const rect = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };

  let pixel;
  let col;
  let tl = false;

  for (let i = start; i < end; i += bytesPerPixel) {
    pixel = i / bytesPerPixel;
    col = pixel % imageData.width;

    if (!tl && topLeft(i)) {
      rect.top = Math.max(Math.floor(pixel / imageData.width) - tlPad, 0);
      rect.left = Math.max(col - tlPad, 0);
      tl = true;
    }

    if (tl && col > rect.left && botRight(i)) {
      rect.height = (Math.floor(pixel / imageData.width) - rect.top) + brPad;
      rect.width = (col - rect.left) + brPad;
      break;
    }
  }

  return rect;
}

/**
 * Handle messages for worker.
 *
 * @param {Object} e - message event.
 * @param {Object} e.data - message event data.
 */
/* eslint-disable no-restricted-globals */
addEventListener('message', (e) => {
  const { imageData, options } = e.data;

  const rect = findFirstRect(imageData, options);

  postMessage(rect, [imageData.data.buffer]);
});
/* eslint-enable no-restricted-globals */
