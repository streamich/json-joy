import * as React from 'react';
import type {SliceFormatting} from '../state/formattings';

export interface FormattingEditProps {
  formatting: SliceFormatting;
}

export const FormattingEdit: React.FC<FormattingEditProps> = ({formatting}) => {
  const renderEdit = formatting.behavior.data().renderCard;

  return (
    renderEdit ? renderEdit(formatting) : <div>no editor</div>
  );
};
