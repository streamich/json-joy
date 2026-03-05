import * as React from 'react';
import {rule} from 'nano-theme';
import {FormattingEdit} from '../views/edit/FormattingEdit';
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
    </form>
  );
};
