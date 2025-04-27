import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {useToolbarPlugin} from '../../../context';
import {FormattingNew} from './FormattingNew';
import type {NewFormatting} from '../../../state/formattings';

export interface FormattingNewCardProps {
  formatting: NewFormatting;
}

export const FormattingNewCard: React.FC<FormattingNewCardProps> = ({formatting}) => {
  const {toolbar} = useToolbarPlugin();

  return (
    <div onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toolbar.newSlice.next(void 0);
      }
    }}>
      <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
        <FormattingNew formatting={formatting} />
      </ContextPane>
    </div>
  );
};
