import {loadGlobal, loadScript} from '../../../utils/loadScript';
import {loadCss} from 'thingies/lib/loadCss';
import {tick} from 'thingies/lib/tick';
import {Defer} from 'thingies/lib/Defer';

export interface IKatex {
  render(
    source: string,
    options: {
      displayMode?: boolean;
      throwOnError?: boolean;
    },
  ): unknown;
}

let cached: Defer<IKatex> | undefined = void 0;

const loadKatex = async (): Promise<IKatex> => {
  if (!cached) {
    cached = new Defer<IKatex>();
    // Load Katex CSS in parallel.
    loadCss('https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.css');
    // Load Katex JS.
    const katex = (await loadGlobal('katex', 'https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.js')) as IKatex;
    // Load Katex Chemistry extension.
    await loadScript('https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/contrib/mhchem.min.js');
    // Wait for chemistry extension to be set-up.
    await tick(1);
    cached.resolve(katex);
  }
  return cached.promise;
};

export default loadKatex;
