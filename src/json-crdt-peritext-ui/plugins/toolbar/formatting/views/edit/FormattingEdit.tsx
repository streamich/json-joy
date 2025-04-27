import * as React from 'react';
import type {EditProps} from '../../../types';

export interface FormattingEditProps extends EditProps {}

export const FormattingEdit: React.FC<FormattingEditProps> = (props) => {
  const Edit = props.formatting.behavior.data().Edit;

  return (
    Edit ? <Edit {...props} /> : <div>no editor</div>
  );
};
