import * as React from 'react';
import {context} from './context';
import {BlockView} from './BlockView';
import {PeritextDOMController} from '../controllers/PeritextDOMController';
import useIsomorphicLayoutEffect from 'react-use/lib/useIsomorphicLayoutEffect';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';

/**
 * @todo The PeritextView should return some imperative API, such as the methods
 *     for finding line wrappings (soft start and end of line) and positions
 *     of characters when moving the cursor up/down.
 */
export interface Props {
  peritext: Peritext;
  debug?: boolean;
  onRender?: () => void;
}

export const PeritextView: React.FC<Props> = React.memo(({peritext, debug, onRender}) => {
  const [, setTick] = React.useState(0);
  const ref = React.useRef<HTMLElement | null>(null);
  const controller = React.useRef<PeritextDOMController | undefined>(undefined);

  const rerender = () => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  };

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = PeritextDOMController.createWithDefaults({el, txt: peritext});
    controller.current = ctrl;
    ctrl.start();
    ctrl.opts.et.addEventListener('change', rerender);
    return () => {
      ctrl.stop();
      ctrl.opts.et.removeEventListener('change', rerender);
    };
  }, [peritext, ref.current]);

  const block = peritext.blocks.root;

  return (
    <context.Provider value={{peritext, dom: controller.current, rerender, debug}}>
      {!!block ? <BlockView el={(el) => ref.current = el} hash={block.hash} block={block} /> : null}
    </context.Provider>
  );
});
