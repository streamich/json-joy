import * as React from 'react';
import {ContextPane, ContextItem, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {useToolbarPlugin} from '../../context';
import {SYMBOL} from 'nano-theme';
import {FormattingGenericIcon} from '../../components/FormattingGenericIcon';
import type {Inline, Peritext, Slice} from '../../../../../json-crdt-extensions';
import type {CaretViewProps} from '../../../../web/react/cursor/CaretView';
import type {Formatting, ToolBarSliceRegistryEntry} from '../../types';
 
class FormattingImpl implements Formatting {
  public constructor(
    public readonly slice: Slice<string>,
    public readonly def: ToolBarSliceRegistryEntry,
  ) {}
}

const getConfigurableFormattingItems = (txt: Peritext, inline?: Inline): Formatting[] => {
  const slices = inline?.p1.layers;
  const res: Formatting[] = [];
  if (!slices) return res;
  const registry = txt.editor.getRegistry();
  for (const slice of slices) {
    const tag = slice.type;
    if (typeof tag !== 'number' && typeof tag !== 'string') continue;
    const def = registry.get(tag);
    if (!def) continue;
    const isConfigurable = !!def.schema;
    if (!isConfigurable) continue;
    res.push(new FormattingImpl(slice, def));
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
  const formattings = React.useMemo(() => getConfigurableFormattingItems(toolbar.txt, inline), [inline?.key()]);

  if (!formattings.length) return;

  return (
    <ContextPane style={{minWidth: 'calc(max(220px, min(360px, 80vw)))'}}>
      <ContextSep />
      {formattings.map((formatting) => {
        const {def, slice} = formatting;
        const data = def.data();
        const menu = data.menu;
        const previewText = data.previewText?.(formatting) || '';
        const previewTextFormatted = previewText.length < 20 ? previewText : `${previewText.slice(0, 20)}${SYMBOL.ELLIPSIS}`;
        return (
          <ContextItem inset
            icon={menu?.icon?.()}
            right={data.renderIcon?.(formatting) || <FormattingGenericIcon formatting={formatting} />}
            onClick={() => {}}
          >
            {menu?.name ?? def.name}
            {!!previewTextFormatted && (
              <span style={{opacity: 0.5}}>
                {previewTextFormatted}
              </span>
            )}
          </ContextItem>
        );
      })}
      <ContextSep />
    </ContextPane>
  );
};
