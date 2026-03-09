import * as React from 'react';
import {FormattingNewGeneric} from './FormattingNewGeneric';
import type {EditProps} from '../../InlineSliceBehavior';

export interface FormattingNewProps extends EditProps {}

export const FormattingNew: React.FC<FormattingNewProps> = (props) => {
  const Edit = props.formatting.behavior.Edit;

  return Edit ? <Edit isNew {...props} /> : <FormattingNewGeneric {...props} />;
};
