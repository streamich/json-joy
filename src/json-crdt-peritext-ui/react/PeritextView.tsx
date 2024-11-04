import * as React from 'react';
import {put} from 'nano-theme';
import {context, type PeritextSurfaceContextValue} from './context';
import {CssClass} from '../constants';
import {BlockView} from './BlockView';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import {DomController} from '../dom/DomController';
import {renderers as defaultRenderers} from '../renderers/default';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {RendererMap} from './types';

put('.' + CssClass.Editor, {
  out: 0,
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  'caret-color': 'transparent',
  '::selection': {
    bgc: 'transparent',
  },

  /** @todo Move these to the default theme. */
  fontVariantNumeric: 'slashed-zero oldstyle-nums',
  fontOpticalSizing: 'auto',
});

/**
 * @todo The PeritextView should return some imperative API, such as the methods
 *     for finding line wrappings (soft start and end of line) and positions
 *     of characters when moving the cursor up/down.
 */
export interface PeritextViewProps {
  peritext: Peritext;
  renderers?: RendererMap[];
  onRender?: () => void;
}

/** @todo Is `React.memo` needed here? */
export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  const {peritext, renderers = [defaultRenderers], onRender} = props;
  const [, setTick] = React.useState(0);
  const ref = React.useRef<HTMLElement | null>(null);
  const dom = React.useRef<DomController | undefined>(undefined);

  const rerender = () => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = new DomController({source: el, txt: peritext});
    dom.current = ctrl;
    ctrl.start();
    ctrl.et.addEventListener('change', rerender);
    return () => {
      ctrl.stop();
      ctrl.et.removeEventListener('change', rerender);
    };
  }, [peritext, ref.current]);

  const block = peritext.blocks.root;
  if (!block) return null;

  const value: PeritextSurfaceContextValue = {
    peritext,
    dom: dom.current,
    renderers,
    rerender,
  };

  let children: React.ReactNode = (
    <div ref={(div) => (ref.current = div)} className={CssClass.Editor}>
      <BlockView hash={block.hash} block={block} />
    </div>
  );
  for (const map of renderers) children = map.peritext?.(props, children) ?? children;
  return <context.Provider value={value}>{children}</context.Provider>;
});
