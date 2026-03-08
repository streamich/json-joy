import * as React from 'react';
import type {EditProps} from '../../InlineSliceBehavior';

export interface FormattingEditProps extends EditProps {}

export const FormattingEdit: React.FC<FormattingEditProps> = (props) => {
  const Edit = props.formatting.behavior.Edit;

  return Edit ? <Edit {...props} /> : <div>no editor</div>;
};
