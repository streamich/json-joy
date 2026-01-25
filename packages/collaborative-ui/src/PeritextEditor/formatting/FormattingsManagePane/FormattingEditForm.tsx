import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {FormattingEdit} from '../views/edit/FormattingEdit';
import {ContextSep} from 'nice-ui/lib/4-card/ContextMenu';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {useSyncStoreOpt} from '../../../PeritextWebUi/react/hooks';
import type {SavedFormatting} from '../../state/formattings';

const blockClass = rule({
  maxW: '600px',
});

export interface FormattingEditFormProps {
  formatting: SavedFormatting;
  onSave?: () => void;
}

export const FormattingEditForm: React.FC<FormattingEditFormProps> = ({formatting, onSave}) => {
  const [t] = useT();
  useSyncStoreOpt(formatting.conf()?.api);
  const validation = formatting.validate();

  const valid = validation === 'good' || validation === 'fine';

  const handleSubmit = () => {
    onSave?.();
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
        <FormattingEdit formatting={formatting} onSave={handleSubmit} />
      </div>

      <ContextSep line />

      <div style={{padding: '16px'}}>
        <Button small lite={!valid} color={'success'} colorStep={'el-1'} block disabled={!valid} submit onClick={() => {}}>
          {t('Done')}
        </Button>
      </div>
    </form>
  );
};
