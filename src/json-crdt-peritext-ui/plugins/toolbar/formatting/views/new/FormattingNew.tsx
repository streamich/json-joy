// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import type {EditProps} from '../../../types';

export interface FormattingNewProps extends EditProps {}

export const FormattingNew: React.FC<FormattingNewProps> = (props) => {
  const Edit = props.formatting.behavior.data().Edit;

  return Edit ? <Edit isNew {...props} /> : <div>new renderer not provided</div>;
};
