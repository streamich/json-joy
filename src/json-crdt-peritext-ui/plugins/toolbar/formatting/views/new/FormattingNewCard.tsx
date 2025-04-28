import {useT} from 'use-t';
import * as React from 'react';
import {ContextPane} from 'nice-ui/lib/4-card/ContextMenu/ContextPane';
import {useToolbarPlugin} from '../../../context';
import {FormattingNew} from './FormattingNew';
import {ContextPaneHeader} from '../../../../../components/ContextPaneHeader';
import {FormattingTitle} from '../../FormattingTitle';
import {ContextPaneHeaderSep} from '../../../../../components/ContextPaneHeaderSep';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {rule} from 'nano-theme';
import {useSyncStoreOpt} from '../../../../../web/react/hooks';
import type {NewFormatting} from '../../../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingNewCardProps {
  formatting: NewFormatting;
}

export const FormattingNewCard: React.FC<FormattingNewCardProps> = ({formatting}) => {
  const [t] = useT();
  const {toolbar} = useToolbarPlugin();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  return (
    <div onKeyDown={(e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        toolbar.newSlice.next(void 0);
      }
    }}>
      <ContextPane style={{display: 'block', width: 'calc(min(600px, max(65vw, 260px)))'}}>
        <form className={blockClass} onSubmit={(e) => {
          e.preventDefault();
          formatting.save();
        }}>
          <ContextPaneHeader short onCloseClick={() => toolbar.newSlice.next(void 0)}>
            <FormattingTitle formatting={formatting} />
          </ContextPaneHeader>
          <ContextPaneHeaderSep />
    
          <div style={{padding: '16px'}}>
            <FormattingNew formatting={formatting} />
          </div>
    
          <ContextSep line />
          
          <div style={{padding: '16px'}}>
            <Button
              small
              lite={!valid}
              positive={validation === 'good'}
              block
              disabled={!valid}
              submit
              onClick={formatting.save}
            >{t('Save')}</Button>
          </div>
        </form>
      </ContextPane>
    </div>
  );
};
