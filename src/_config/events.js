import {svgToJpeg} from './events/svg-to-jpeg.js';
import {buildAllCss} from './events/build-css.js';
import {buildAllJs} from './events/build-js.js';
import { getLatestCommitInfo } from './events/git-commit-info.js';
import {buildPagefind} from './events/build-pagefind.js';


export default {
  svgToJpeg,
  buildAllCss,
  buildAllJs,
  getLatestCommitInfo,
  buildPagefind
};
