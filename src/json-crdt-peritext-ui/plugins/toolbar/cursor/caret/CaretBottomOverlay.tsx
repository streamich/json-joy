import * as React from 'react';
import {ContextPane, ContextItem, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {useToolbarPlugin} from '../../context';
import type {Inline, Peritext, Slice} from '../../../../../json-crdt-extensions';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';
import type {ToolBarSliceRegistryEntry} from '../../types';
 
class ToolbarSlice {
  public constructor(
    public readonly slice: Slice<string>,
    public readonly def: ToolBarSliceRegistryEntry,
  ) {}
}

const getConfigurableFormattingItems = (txt: Peritext, inline?: Inline) => {
  const slices = inline?.p1.layers;
  const res: ToolbarSlice[] = [];
  if (!slices) return res;
  const registry = txt.editor.getRegistry();
  for (const slice of slices) {
    const tag = slice.type;
    if (typeof tag !== 'number' && typeof tag !== 'string') continue;
    const def = registry.get(tag);
    if (!def) continue;
    const isConfigurable = !!def.schema;
    if (!isConfigurable) continue;
    res.push(new ToolbarSlice(slice, def));
  }
  return res;
};

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;
  const {toolbar} = useToolbarPlugin();
  const formatting = React.useMemo(() => getConfigurableFormattingItems(toolbar.txt, inline), [inline?.key()]);

  if (!formatting.length) return;

  return (
    <ContextPane style={{minWidth: 'calc(max(220px, min(360px, 80vw)))'}}>
      <ContextSep />
      {formatting.map(({slice, def}, index) => {
        const menu = def.data().menu;
        return (
          <ContextItem inset icon={menu?.icon?.()} right={<div>right</div>} onClick={() => {}}>
            {def.data().menu?.name ?? def.name}
          </ContextItem>
        );
      })}
      <ContextSep />
    </ContextPane>
  );
};
