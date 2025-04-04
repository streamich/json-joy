import * as React from 'react';
import {createPortal} from 'react-dom';
import {put} from 'nano-theme';
import {CssClass} from '../constants';
import {CursorPlugin} from '../../plugins/cursor';
import {defaultPlugin} from '../../plugins/minimal';
import {PeritextSurfaceState} from '../state';
import {createEvents} from '../../events';
import {context} from './context';
import {BlockView} from './BlockView';
import {useSyncStore} from './hooks';
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
}

export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  const {peritext, plugins: plugins_, onState} = props;
  const ref = React.useRef<HTMLDivElement>(null);

  // Plugins provided through props, or a default set of plugins.
  const plugins = React.useMemo(() => plugins_ ?? [new CursorPlugin(), defaultPlugin], [plugins_]);

  // Create the DOM element for the editor. And instantiate the state management.
  const [el, state, stop] = React.useMemo(() => {
    const div = document.createElement('div');
    div.className = CssClass.Editor;
    const events = createEvents(peritext);
    const state = new PeritextSurfaceState(events, div, plugins);
    const stop = state.start();
    return [div, state, stop] as const;
  }, [peritext, plugins]);

  // Call life-cycle methods on the state.
  React.useLayoutEffect(() => stop, [stop]);

  React.useLayoutEffect(() => {
    onState?.(state);
  }, [onState, state]);

  // Attach imperatively constructed <div> element to our container.
  React.useLayoutEffect(() => {
    const div = ref.current;
    if (!div) return;
    const parent = div.parentElement!;
    parent.appendChild(el);
    return () => {
      if (el.parentNode === parent) parent.removeChild(el);
    };
  }, [el]);

  // Return the final result.
  return (
    <context.Provider value={state}>
      <PeritextViewInner div={ref} state={state} />
    </context.Provider>
  );
});

interface PeritextViewInnerProps {
  state: PeritextSurfaceState;
  div: React.RefObject<HTMLDivElement>;
}

const PeritextViewInner: React.FC<PeritextViewInnerProps> = React.memo((props) => {
  const {state, div} = props;
  const {peritext, render, el, plugins} = state;

  // Subscribe to re-render events.
  useSyncStore(render);

  // Render the main body of the editor.
  const block = peritext.blocks.root;
  let children: React.ReactNode = block ? createPortal(<BlockView hash={block.hash} block={block} />, el) : null;

  // Create container element, into which we will insert imperatively
  // constructed <div> element.
  children = (
    <>
      <div ref={div} style={{visibility: 'hidden'}} />
      {children}
    </>
  );

  // Run the plugins to decorate our content body.
  for (const {peritext: decorator} of plugins) if (decorator) children = decorator(children, state);

  // Return the final result.
  return children;
});
