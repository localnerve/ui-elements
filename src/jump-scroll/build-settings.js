/**
 * Build settings
 * 
 * Copyright (c) 2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */
import * as path from 'node:path';
import * as url from 'node:url';

export const thisDir = url.fileURLToPath(new URL('.', import.meta.url));
export const stageDir = path.join(thisDir, 'tmp');
export const distDir = path.join(thisDir, 'dist');
