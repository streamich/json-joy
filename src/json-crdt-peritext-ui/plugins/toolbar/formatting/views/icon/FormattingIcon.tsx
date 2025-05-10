// biome-ignore lint: lint/style/useImportType
import * as React from 'react';
import {GenericIcon} from './GenericIcon';
import type {IconProps} from '../../../types';

export interface FormattingIconProps extends IconProps {}

export const FormattingIcon: React.FC<FormattingIconProps> = (props) =>
  props.formatting.behavior.data().renderIcon?.(props) ?? <GenericIcon {...props} />;
