import * as React from 'react';
import {context, type PeritextSurfaceContextValue} from './context';
import {BlockView} from './BlockView';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import {PeritextDomController} from '../events/PeritextDomController';
import {renderers as defaultRenderers} from '../renderers/default';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {RendererMap} from './types';

/**
 * @todo The PeritextView should return some imperative API, such as the methods
 *     for finding line wrappings (soft start and end of line) and positions
 *     of characters when moving the cursor up/down.
 */
export interface Props {
  peritext: Peritext;
  renderers?: RendererMap[];
  debug?: boolean;
  onRender?: () => void;
}

/** @todo Is `React.memo` needed here? */
export const PeritextView: React.FC<Props> = React.memo(({peritext, renderers = [defaultRenderers], debug, onRender}) => {
  const [, setTick] = React.useState(0);
  const ref = React.useRef<HTMLElement | null>(null);
  const controller = React.useRef<PeritextDomController | undefined>(undefined);

  const rerender = () => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = new PeritextDomController({source: el, txt: peritext});
    controller.current = ctrl;
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
    dom: controller.current,
    renderers,
    rerender,
    debug,
  };

  return (
    <context.Provider value={value}>
      <BlockView el={(el) => ref.current = el} hash={block.hash} block={block} />
    </context.Provider>
  );
});
