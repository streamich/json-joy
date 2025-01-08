import * as React from 'react';
import {put} from 'nano-theme';
import {context} from './context';
import {CssClass} from '../constants';
import {BlockView} from './BlockView';
import {DomController} from '../dom/DomController';
import {CursorPlugin} from '../plugins/cursor';
import {defaultPlugin} from '../plugins/minimal';
import {PeritextSurfaceState} from './state';
import {create} from '../events';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {PeritextPlugin} from './types';

put('.' + CssClass.Editor, {
  out: 0,
  whiteSpace: 'nowrap',
  wordWrap: 'break-word',
  'caret-color': 'transparent',
  '::selection': {
    bgc: 'transparent',
  },

  /** @todo Move these to the default theme. */
  fontVariantNumeric: 'slashed-zero oldstyle-nums',
  fontOpticalSizing: 'auto',
});

put('.' + CssClass.Inline, {
  whiteSpace: 'pre-wrap',
});

/**
 * @todo The PeritextView should return some imperative API, such as the methods
 *     for finding line wrappings (soft start and end of line) and positions
 *     of characters when moving the cursor up/down.
 */
export interface PeritextViewProps {
  peritext: Peritext;
  plugins?: PeritextPlugin[];
  onRender?: () => void;
}

/** @todo Is `React.memo` needed here? */
export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  // TODO: create hook which instantiates default plugins?
  const {peritext, plugins = [new CursorPlugin(), defaultPlugin], onRender} = props;
  const [, setTick] = React.useState(0);
  const [dom, setDom] = React.useState<DomController | undefined>(undefined);
  
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const rerender = React.useCallback(() => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  }, [peritext]);

  const state: PeritextSurfaceState = React.useMemo(
    () => new PeritextSurfaceState(peritext, plugins, rerender),
    [peritext, plugins, rerender],
  );

  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const ref = React.useCallback(
    (el: null | HTMLDivElement) => {
      if (!el) {
        if (dom) {
          dom.stop();
          dom.et.removeEventListener('change', rerender);
          state.dom = void 0;
          setDom(undefined);
        }
        return;
      }
      if (dom && dom.opts.source === el) return;
      const events = create(peritext);
      const ctrl = new DomController({source: el, events});
      ctrl.start();
      state.dom = ctrl;
      setDom(ctrl);
      ctrl.et.addEventListener('change', rerender);
    },
    [peritext, state],
  );

  const block = peritext.blocks.root;
  if (!block) return null;

  let children: React.ReactNode = (
    <div ref={ref} className={CssClass.Editor}>
      {!!dom && (
        <context.Provider value={state}>
          <BlockView hash={block.hash} block={block} />
        </context.Provider>
      )}
    </div>
  );

  for (const map of plugins) children = map.peritext?.(props, children, state) ?? children;

  return children;
});
