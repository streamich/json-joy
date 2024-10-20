import * as React from 'react';
import {rule} from 'nano-theme';
import {context, type PeritextSurfaceContextValue} from './context';
import {BlockView} from './BlockView';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import {PeritextDomController} from '../events/PeritextDomController';
import {renderers as defaultRenderers} from '../renderers/default';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {RendererMap} from './types';

const blockClass = rule({
  out: 0,
  'caret-color': 'transparent',
  '::selection': {
    bgc: 'transparent',
  },
});

/**
 * @todo The PeritextView should return some imperative API, such as the methods
 *     for finding line wrappings (soft start and end of line) and positions
 *     of characters when moving the cursor up/down.
 */
export interface Props {
  peritext: Peritext;
  renderers?: RendererMap[];
  onRender?: () => void;
}

/** @todo Is `React.memo` needed here? */
export const PeritextView: React.FC<Props> = React.memo(({peritext, renderers = [defaultRenderers], onRender}) => {
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
  };

  return (
    <context.Provider value={value}>
      <div ref={div => ref.current = div} className={blockClass}>
        <BlockView hash={block.hash} block={block} />
      </div>
    </context.Provider>
  );
});
