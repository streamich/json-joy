import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {useToolbarPlugin} from '../../context';
import {FormattingNew} from './FormattingNew';
import {FormattingNewState} from './FormattingNewState';
import type {NewFormatting} from '../../state/formattings';

export interface FormattingNewCardProps {
  formatting: NewFormatting;
}

export const FormattingNewCard: React.FC<FormattingNewCardProps> = ({formatting}) => {
  const {toolbar} = useToolbarPlugin();
  const state = React.useMemo(() => new FormattingNewState(formatting), [formatting]);

  return (
    <div onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toolbar.newSlice.next(void 0);
      }
    }}>
      <ContextPane style={{display: 'block', minWidth: 'calc(min(600px, max(50vw, 260px)))'}}>
        <FormattingNew state={state} />
      </ContextPane>
    </div>
  );
};
