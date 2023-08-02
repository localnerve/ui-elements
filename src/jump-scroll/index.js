/**
 * jump-scroll Node entry point
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as url from 'node:url';

const thisDir = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Get the css file contents.
 * Useful for CSP builds.
 *
 * @returns {String} The utf8 css file content
 */
export async function JumpScrollCssText () {
  return await fs.readFile(path.join(thisDir, 'jump-scroll.css'), {
    encoding: 'utf8'
  });
}