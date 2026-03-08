import * as React from 'react';
import type {ViewProps} from '../../InlineSliceBehavior';

export interface FormattingViewProps extends ViewProps {}

export const FormattingView: React.FC<FormattingViewProps> = (props) => {
  const View = props.formatting.behavior.View;

  return View ? <View {...props} /> : <div>no editor</div>;
};
