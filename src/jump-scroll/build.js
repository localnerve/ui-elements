/**
 * Build script for jump-scroll web component
 * 
 * Copyright (c) 2023 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import CleanCss from 'clean-css';
import { thisDir, stageDir, distDir } from './build-settings.js';

const cssFilePath = path.join(thisDir, 'jump-scroll.css');
const indexFilePath = path.join(thisDir, 'index.js');

/**
 * Stage the web component file.
 * 
 * @param {String} cssDir - directory of the css file to read
 * @param {String} jsDir - directory of the js file to read
 * @param {String} outputDir - directory of the component file to write to
 */
async function stageComponentFile (cssDir, jsDir, outputDir) {
  const cssText = await fs.readFile(
    path.join(cssDir, path.basename(cssFilePath)), {
      encoding: 'utf8'
    }
  );
  const jsText = await fs.readFile(path.join(jsDir, 'jump-scroll.js'), { encoding: 'utf8' });
  
  const jsOutput = jsText.replace('__CSS_REPLACEMENT__', cssText);
  await fs.writeFile(path.join(outputDir, 'jump-scroll.js'), jsOutput, { encoding: 'utf8' });
}

/**
 * Transform the css file.
 * 
 * @param {String} cssDir - directory of the css file to read and write
 */
async function transformCss (cssDir) {
  const outputCssFile = path.join(cssDir, path.basename(cssFilePath));
  const cssText = await fs.readFile(outputCssFile, { encoding: 'utf8' });
  const cleanCss = new CleanCss().minify(cssText);
  await fs.writeFile(outputCssFile, cleanCss.styles, { encoding: 'utf8' });
}

/**
 * Copy file assets.
 * 
 * @param {String} outputDir - the output directory to write to.
 */
async function cpAssets (outputDir) {
  await fs.cp(indexFilePath, path.join(outputDir, path.basename(indexFilePath)));
  await fs.cp(cssFilePath, path.join(outputDir, path.basename(cssFilePath)));
}

/**
 * Main build script.
 */
async function build () {
  await fs.rm(stageDir, { recursive: true, force: true });
  await fs.mkdir(stageDir, { recursive: true });
  
  await cpAssets(distDir);
  await transformCss(distDir);
  await stageComponentFile(distDir, thisDir, stageDir);
}

await build();