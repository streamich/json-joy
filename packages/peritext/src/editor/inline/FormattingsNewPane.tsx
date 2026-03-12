import * as React from 'react';
import {useT} from 'use-t';
import {useEditor} from '../context';
import {FormattingNew} from './views/new/FormattingNew';
import {FormattingTitle} from './FormattingTitle';
import {rule} from 'nano-theme';
import {FormattingPane} from './FormattingPane';
import {ContextPaneHeader} from '../components/ContextPaneHeader';
import {ContextPaneHeaderSep} from '../components/ContextPaneHeaderSep';
import {useSyncStoreOpt} from '../../web/react/hooks';
import {Flex} from '@jsonjoy.com/ui/lib/3-list-item/Flex';
import BasicButton from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import type {NewFormatting} from '../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingsNewPaneProps {
  formatting: NewFormatting;
  onSave: () => void;
}

export const FormattingsNewPane: React.FC<FormattingsNewPaneProps> = ({formatting, onSave}) => {
  const [t] = useT();
  const state = useEditor();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  const handleSave = (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    onSave();
  };

  return (
    <FormattingPane onEsc={() => state.newSlice.next(void 0)}>
      <form className={blockClass} onSubmit={handleSave}>
        <ContextPaneHeader
          short
          onCloseClick={() => state.newSlice.next(void 0)}
          right={
            <Flex style={{justifyContent: 'flex-end', alignItems: 'center'}}>
              <BasicButton fill width={'auto'} disabled={!valid} onClick={valid ? onSave : void 0}>
                {t('Save')}
              </BasicButton>
            </Flex>
          }
        >
          <FormattingTitle formatting={formatting} />
        </ContextPaneHeader>
        <ContextPaneHeaderSep />
        <div style={{padding: '16px'}}>
          <FormattingNew formatting={formatting} onSave={handleSave} />
        </div>
      </form>
    </FormattingPane>
  );
};
