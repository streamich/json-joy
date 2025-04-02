import * as React from 'react';
import {createPortal} from 'react-dom';
import {put} from 'nano-theme';
import {CssClass} from '../constants';
import {CursorPlugin} from '../../plugins/cursor';
import {defaultPlugin} from '../../plugins/minimal';
import {PeritextSurfaceState} from './state';
import {createEvents} from '../../events';
import {context} from './context';
import {BlockView} from './BlockView';
import type {PeritextPlugin} from './types';
import type {Peritext} from '../../../json-crdt-extensions';

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

export interface PeritextViewProps {
  peritext: Peritext;
  plugins?: PeritextPlugin[];
  onState?: (state: PeritextSurfaceState) => void;
  onRender?: () => void;
}

export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  const {peritext, plugins: plugins_, onRender, onState} = props;
  const ref = React.useRef<HTMLDivElement>(null);

  // The `rerender` callback can be called to force a re-render of the editor.
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const [, setTick] = React.useState(0);
  const rerender = React.useCallback(() => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  }, [peritext]);
  
  // Plugins provided through props, or a default set of plugins.
  const plugins = React.useMemo(() => plugins_ ?? [new CursorPlugin(), defaultPlugin], [peritext, plugins_]);

  // Create the DOM element for the editor. And instantiate the state management.
  const [state, stop] = React.useMemo(() => {
    const div = document.createElement('div');
    div.className = CssClass.Editor;
    const events = createEvents(peritext);
    const state = new PeritextSurfaceState(events, div, rerender, plugins);
    const stop = state.start();
    onState?.(state);
    return [state, stop];
  }, [peritext, rerender, plugins]);

  // Call life-cycle methods on the state.
  React.useLayoutEffect(() => stop, [stop]);

  // Attach imperatively constructed <div> element to our container.
  React.useLayoutEffect(() => {
    const parent = ref.current;
    if (!parent) return;
    const el = state.el;
    parent.appendChild(el);
    return () => {
      if (el.parentNode === parent) parent.removeChild(el);
    };
  }, [ref.current, state.el]);
  
  // Render the main body of the editor.
  const block = peritext.blocks.root;
  let children: React.ReactNode = createPortal(
    <context.Provider value={state}>
      {block ? <BlockView hash={block.hash} block={block} /> : null}
    </context.Provider>,
    state.el,
  );

  // Create container element, into which we will insert imperatively
  // constructed <div> element.
  children = (
    <div ref={ref}>
      {children}
    </div>
  );

  // Run the plugins to decorate our content body.
  for (const map of plugins) children = map.peritext?.(children, state) ?? children;

  // Return the final result.
  return children;
});
