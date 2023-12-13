/**
 * Build script for jump-scroll web component
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { build } from '@localnerve/web-component-build';
import { thisDir, stageDir, distDir } from './build-settings.js';

const cssFilePath = path.join(thisDir, 'jump-scroll.css');
const htmlFilePath = path.join(thisDir, 'jump-scroll.html');
const jsFilePath = path.join(thisDir, 'jump-scroll.js');
const jsReplacement = '__JS_REPLACEMENT__';
const indexFilePath = path.join(thisDir, 'index.js');

/**
 * Main build script.
 */
async function buildwc () {
  await fs.rm(stageDir, { recursive: true, force: true });
  await fs.mkdir(stageDir, { recursive: true });
  
  const result = await build(stageDir, {
    cssPath: cssFilePath,
    htmlPath: htmlFilePath,
    jsPath: jsFilePath,
    jsReplacement
  });
  // webpack creates the dist bundle from stageDir

  await fs.cp(indexFilePath, path.join(distDir, path.basename(indexFilePath)));
  await fs.cp(result.cssPath, path.join(distDir, path.basename(result.cssPath)));
}

await buildwc();