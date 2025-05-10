// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {useToolbarPlugin} from '../../context';
import {FormattingEdit} from '../views/edit/FormattingEdit';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {useSyncStoreOpt} from '../../../../web/react/hooks';
import type {SavedFormatting} from '../../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingEditFormProps {
  formatting: SavedFormatting;
  onDone?: () => void;
}

export const FormattingEditForm: React.FC<FormattingEditFormProps> = ({formatting, onDone}) => {
  const [t] = useT();
  const {toolbar} = useToolbarPlugin();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  const handleSubmit = () => {
    onDone?.();
  };

  return (
    <form
      className={blockClass}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div style={{padding: '16px'}}>
        <FormattingEdit formatting={formatting} />
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
          onClick={handleSubmit}
        >
          {t('Done')}
        </Button>
      </div>
    </form>
  );
};
