// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {useT} from 'use-t';
import {useToolbarPlugin} from '../context';
import {FormattingNew} from './views/new/FormattingNew';
import {ContextPaneHeader} from '../../../components/ContextPaneHeader';
import {FormattingTitle} from './FormattingTitle';
import {ContextPaneHeaderSep} from '../../../components/ContextPaneHeaderSep';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {rule} from 'nano-theme';
import {useSyncStoreOpt} from '../../../web/react/hooks';
import {FormattingPane} from './FormattingPane';
import type {NewFormatting} from '../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingsNewPaneProps {
  formatting: NewFormatting;
}

export const FormattingsNewPane: React.FC<FormattingsNewPaneProps> = ({formatting}) => {
  const [t] = useT();
  const {toolbar} = useToolbarPlugin();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  return (
    <FormattingPane onEsc={() => toolbar.newSlice.next(void 0)}>
      <form
        className={blockClass}
        onSubmit={(e) => {
          e.preventDefault();
          formatting.save();
        }}
      >
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
          >
            {t('Save')}
          </Button>
        </div>
      </form>
    </FormattingPane>
  );
};
