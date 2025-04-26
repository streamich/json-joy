import * as React from 'react';
import {put} from 'nano-theme';
import {CssClass} from '../constants';
import {CursorPlugin} from '../../plugins/cursor';
import {defaultPlugin} from '../../plugins/minimal';
import {PeritextSurfaceState} from '../state';
import {createEvents} from '../../events';
import {context} from './context';
import {BlockView} from './BlockView';
import {useBehaviorSubject} from 'nice-ui/lib/hooks/useBehaviorSubject';
import type {PeritextPlugin} from './types';
import type {Peritext} from '../../../json-crdt-extensions';

put('.' + CssClass.Editor, {
  out: 0,
  whiteSpace: 'nowrap',
  wordWrap: 'break-word',

  /** @todo Move these to the default theme. */
  fontVariantNumeric: 'slashed-zero oldstyle-nums',
  fontOpticalSizing: 'auto',
});

put('.' + CssClass.Inline, {
  whiteSpace: 'pre-wrap',
});

export interface PeritextViewProps {
  peritext: Peritext;

  /**
   * Array of plugins use to render editor content and provide additional
   * functionality. The plugin list must be memorized and not recreated on
   * every render. If omitted, a default set of plugins will be used.
   */
  plugins?: PeritextPlugin[];

  /**
   * Called when the editor is started, DOM is created, main DOM handlers have
   * been initialized. Receives the {@link PeritextSurfaceState} instance used
   * to manage the editor.
   *
   * @param state json-joy Peritext state manager.
   */
  onStart?: (state: PeritextSurfaceState) => void;
}

export const PeritextView: React.FC<PeritextViewProps> = React.memo((props) => {
  const {peritext, plugins: plugins_, onStart: onState} = props;

  // The `.stop()` is called when the editor unmounts.
  const stop = React.useRef<undefined | (() => void)>(void 0);

  // Plugins provided through props, or a default set of plugins.
  const plugins = React.useMemo(() => plugins_ ?? [new CursorPlugin(), defaultPlugin], [plugins_]);

  /** Create the {@link PeritextSurfaceState} state management instance. */
  const state = React.useMemo(() =>
    new PeritextSurfaceState(createEvents(peritext), plugins), [peritext, plugins]);

  /** Call `.start()` of {@link PeritextSurfaceState} and setup HTML element. */
  const ref = (el: HTMLDivElement | null) => {
    if (!el) return;
    state.el = el;
    stop.current = state.start();
    onState?.(state);
  };

  /** Call `.stop()` of {@link PeritextSurfaceState} when the component unmounts. */
  React.useLayoutEffect(() => () => stop.current?.(), [stop]);

  // Return the final result.
  return (
    <context.Provider value={state}>
      <PeritextViewInner div={ref} state={state} />
    </context.Provider>
  );
});

interface PeritextViewInnerProps {
  state: PeritextSurfaceState;
  div: (div: HTMLDivElement | null) => void;
}

const PeritextViewInner: React.FC<PeritextViewInnerProps> = React.memo((props) => {
  const {state, div} = props;

  // Subscribe to re-render events.
  useBehaviorSubject(state.render$);

  // Render the main body of the editor.
  const block = state.peritext.blocks.root;

  let children: React.ReactNode = (
    <div ref={div} className={CssClass.Editor}>
      <BlockView hash={block.hash} block={block} />
    </div>
  );

  // Run the plugins to decorate our content body.
  for (const plugin of state.plugins)
    children = plugin.peritext?.(children, state) ?? children;

  // Return the final result.
  return children;
});
