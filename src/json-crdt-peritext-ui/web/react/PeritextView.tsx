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

  // The `setTick` is used to force re-renders.
  const [, setTick] = React.useState(0);
  
  // Plugins provided through props, or a default set of plugins.
  const plugins = React.useMemo(() => plugins_ ?? [new CursorPlugin(), defaultPlugin], [peritext, plugins_]);

  // Create the DOM element for the editor. And instantiate the state management.
  const [el, state, stop] = React.useMemo(() => {
    const div = document.createElement('div');
    div.className = CssClass.Editor;
    const events = createEvents(peritext);
    const rerender = () => {
      peritext.refresh();
      setTick((tick) => tick + 1);
      if (onRender) onRender();
    };
    const state = new PeritextSurfaceState(events, div, rerender, plugins);
    const stop = state.start();
    onState?.(state);
    return [div, state, stop] as const;
  }, [peritext, plugins]);

  // Call life-cycle methods on the state.
  React.useLayoutEffect(() => stop, [stop]);

  // Attach imperatively constructed <div> element to our container.
  React.useLayoutEffect(() => {
    const div = ref.current;
    if (!div) return;
    const parent = div.parentElement!;
    parent.appendChild(el);
    return () => {
      if (el.parentNode === parent) parent.removeChild(el);
    };
  }, [ref.current, el]);
  
  // Render the main body of the editor.
  const block = peritext.blocks.root;
  let children: React.ReactNode = block ? createPortal(<BlockView hash={block.hash} block={block} />, el) : null;

  // Create container element, into which we will insert imperatively
  // constructed <div> element.
  children = (
    <>
      <div ref={ref} style={{visibility: 'hidden'}} />
      {children}
    </>
  );

  // Run the plugins to decorate our content body.
  for (const map of plugins) children = map.peritext?.(children, state) ?? children;

  // Return the final result.
  return (
    <context.Provider value={state}>
      {children}
    </context.Provider>
  );
});
