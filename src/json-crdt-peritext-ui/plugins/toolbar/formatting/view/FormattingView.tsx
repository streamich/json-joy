import * as React from 'react';
import type {EditProps} from '../../types';

export interface FormattingViewProps extends EditProps {}

export const FormattingView: React.FC<FormattingViewProps> = (props) => {
  const View = props.formatting.behavior.data().View;

  return (
    View ? <View {...props} /> : <div>no editor</div>
  );
};
