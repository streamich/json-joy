import * as React from 'react';
import {GenericIcon} from './GenericIcon';
import type {IconProps} from '../../types';

export interface FormattingIconProps extends IconProps {}

export const FormattingIcon: React.FC<FormattingIconProps> = (props) => {
  const Icon = props.formatting.behavior.data().Icon;

  return (
    Icon ? <Icon {...props} /> : <GenericIcon {...props} />
  );
};
