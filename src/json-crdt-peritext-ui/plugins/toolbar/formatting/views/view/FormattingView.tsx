// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import type {ViewProps} from '../../../types';

export interface FormattingViewProps extends ViewProps {}

export const FormattingView: React.FC<FormattingViewProps> = (props) => {
  const View = props.formatting.behavior.data().View;

  return View ? <View {...props} /> : <div>no editor</div>;
};
