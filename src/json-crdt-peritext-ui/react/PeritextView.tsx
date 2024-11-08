import * as React from 'react';
import {put} from 'nano-theme';
import {context, type PeritextSurfaceContextValue} from './context';
import {CssClass} from '../constants';
import {BlockView} from './BlockView';
import {DomController} from '../dom/DomController';
import {renderers as defaultRenderers} from '../plugins/minimal';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {PeritextPlugin} from './types';

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
  renderers?: PeritextPlugin[];
  onRender?: () => void;
}

/** @todo Is `React.memo` needed here? */
export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  const {peritext, renderers = [defaultRenderers], onRender} = props;
  const [, setTick] = React.useState(0);
  const [dom, setDom] = React.useState<DomController | undefined>(undefined);

  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const rerender = React.useCallback(() => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  }, [peritext]);

  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const ref = React.useCallback(
    (el: null | HTMLDivElement) => {
      if (!el) {
        if (dom) {
          dom.stop();
          dom.et.removeEventListener('change', rerender);
          setDom(undefined);
        }
        return;
      }
      if (dom && dom.opts.source === el) return;
      const ctrl = new DomController({source: el, txt: peritext});
      ctrl.start();
      setDom(ctrl);
      ctrl.et.addEventListener('change', rerender);
    },
    [peritext],
  );

  const block = peritext.blocks.root;
  if (!block) return null;

  const ctx: undefined | PeritextSurfaceContextValue = dom ? {peritext, dom, renderers, rerender} : undefined;

  let children: React.ReactNode = (
    <div ref={ref} className={CssClass.Editor}>
      {!!dom && (
        <context.Provider value={ctx!}>
          <BlockView hash={block.hash} block={block} />
        </context.Provider>
      )}
    </div>
  );

  for (const map of renderers) children = map.peritext?.(props, children, ctx) ?? children;

  return children;
});
