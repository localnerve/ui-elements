/**
 * Build settings
 */
import * as path from 'node:path';
import * as url from 'node:url';

export const thisDir = url.fileURLToPath(new URL('.', import.meta.url));
export const stageDir = path.join(thisDir, 'tmp');
export const distDir = path.join(thisDir, 'dist');
