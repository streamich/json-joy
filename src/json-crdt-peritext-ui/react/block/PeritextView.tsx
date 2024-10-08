import * as React from 'react';
import {context} from '../context';
import {RootBlockView} from './RootBlockView';
import {PeritextDOMController} from '../../controllers/PeritextDOMController';
import type {Peritext} from '../../../json-crdt-extensions/peritext/Peritext';

export interface Props {
  peritext: Peritext;
  debug?: boolean;
  onRender?: () => void;
}

export const PeritextView: React.FC<Props> = React.memo(({peritext, debug, onRender}) => {
  const [, setTick] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const controller = React.useRef<PeritextDOMController | undefined>(undefined);

  const rerender = () => {
    peritext.refresh();
    setTick((tick) => tick + 1);
    if (onRender) onRender();
  };

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctrl = ((controller as any).current = PeritextDOMController.createWithDefaults({el, txt: peritext}));
    ctrl.start();
    ctrl.opts.et.addEventListener('change', rerender);
    return () => {
      ctrl.stop();
      ctrl.opts.et.removeEventListener('change', rerender);
    };
  }, [peritext, ref.current]);

  return (
    <context.Provider value={{peritext, dom: controller.current, rerender, debug}}>
      <RootBlockView ref={ref} />
    </context.Provider>
  );
});
