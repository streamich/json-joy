import {loadGlobal} from '../../../utils/loadScript';

export interface IMathJax {
  tex2svg(): HTMLElement;
}

let cache: Promise<IMathJax> | undefined;

const loadMathjax = () => {
  if (!cache) {
    /*
    (window as any).MathJax = {
      loader: {
        load: [
          'input/asciimath'
        ],
      },
    };
    */

    cache = loadGlobal('MathJax', 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg-full.js');
  }

  return cache;
};

export default loadMathjax;
