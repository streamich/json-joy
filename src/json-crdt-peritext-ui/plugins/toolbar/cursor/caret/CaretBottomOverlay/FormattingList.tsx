import * as React from 'react';
import {ContextPane, ContextItem, ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {SYMBOL} from 'nano-theme';
import {FormattingGenericIcon} from '../../../components/FormattingGenericIcon';
import {SliceFormatting} from '../../../state/formattings';

export interface FormattingListProps {
  formattings: SliceFormatting[];
  onSelect: (formatting: SliceFormatting) => void;
}

export const FormattingList: React.FC<FormattingListProps> = ({formattings, onSelect}) => {
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
            key={formatting.key()}
            icon={menu?.icon?.()}
            right={data.renderIcon?.(formatting) || <FormattingGenericIcon formatting={formatting} />}
            onClick={() => onSelect(formatting)}
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
