import * as React from 'react';
import {ContextPane, ContextItem, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {useToolbarPlugin} from '../../../context';
import {SYMBOL} from 'nano-theme';
import {FormattingGenericIcon} from '../../../components/FormattingGenericIcon';
import {CaretBottomState} from './state';
import type {CaretViewProps} from '../../../../../web/react/cursor/CaretView';

export interface CaretBottomOverlayProps extends CaretViewProps {
  children: React.ReactNode;
}

export const CaretBottomOverlay: React.FC<CaretBottomOverlayProps> = (props) => {
  const {fwd, bwd} = props;
  const inline = fwd || bwd;
  const {toolbar} = useToolbarPlugin();
  const state = React.useMemo(() => new CaretBottomState(toolbar), [toolbar]);
  const formattings = React.useMemo(() => state.getFormatting(inline), [inline?.key()]);

  if (!formattings.length) return;

  return (
    <ContextPane style={{minWidth: 'calc(max(220px, min(360px, 80vw)))'}}>
      <ContextSep />
      {formattings.map((formatting) => {
        const {behavior} = formatting;
        const data = behavior.data();
        const menu = data.menu;
        const previewText = data.previewText?.(formatting) || '';
        const previewTextFormatted = previewText.length < 20 ? previewText : `${previewText.slice(0, 20)}${SYMBOL.ELLIPSIS}`;
        return (
          <ContextItem inset
            icon={menu?.icon?.()}
            right={data.renderIcon?.(formatting) || <FormattingGenericIcon formatting={formatting} />}
            onClick={() => {}}
          >
            {menu?.name ?? behavior.name}
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
