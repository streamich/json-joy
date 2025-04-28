import * as React from 'react';
import type {EditProps} from '../../types';

export interface FormattingNewProps extends EditProps {}

export const FormattingNew: React.FC<FormattingNewProps> = (props) => {
  const New = props.formatting.behavior.data().Edit;

  return (
    New ? <New {...props} /> : <div>new renderer not provided</div>
  );
};
