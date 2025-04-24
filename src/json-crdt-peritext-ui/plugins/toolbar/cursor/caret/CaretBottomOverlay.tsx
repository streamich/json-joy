import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu';
import {useToolbarPlugin} from '../../context';
import type {SliceRegistryEntry} from '../../../../../json-crdt-extensions/peritext/registry/SliceRegistryEntry';
import type {Inline, Peritext, Slice} from '../../../../../json-crdt-extensions';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';
 
class FormattingItem {
  public constructor(
    public readonly slice: Slice<string>,
    public readonly def: SliceRegistryEntry,
  ) {}
}

const getConfigurableFormattingItems = (txt: Peritext, inline?: Inline) => {
  const slices = inline?.p1.layers;
  const res: FormattingItem[] = [];
  if (!slices) return res;
  const registry = txt.editor.getRegistry();
  for (const slice of slices) {
    const tag = slice.type;
    if (typeof tag !== 'number' && typeof tag !== 'string') continue;
    const def = registry.get(tag);
    if (!def) continue;
    const isConfigurable = !!def.schema;
    if (!isConfigurable) continue;
    res.push(new FormattingItem(slice, def));
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
    <ContextPane>
      {formatting.map(({slice, def}, index) => (
        <div>{slice.type}, {def.name}</div>
      ))}
    </ContextPane>
  );
};
