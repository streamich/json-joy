import * as React from 'react';
import type {EditProps} from '../../InlineSliceBehavior';

export interface FormattingNewGenericProps extends EditProps {}

export const FormattingNewGeneric: React.FC<FormattingNewGenericProps> = ({formatting}) => {
  return <div>Generic configurator</div>;
};
