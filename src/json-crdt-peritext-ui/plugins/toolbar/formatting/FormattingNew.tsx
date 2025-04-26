import * as React from 'react';
import type {NewProps} from '../types';

export const FormattingNew: React.FC<NewProps> = (props) => {
  const New = props.formatting.behavior.data().New;

  return (
    New ? <New {...props} /> : <div>new renderer not provided</div>
  );
};
