import * as React from 'react';
import {GenericIcon} from './GenericIcon';
import type {IconProps} from '../../InlineSliceBehavior';

export interface FormattingIconProps extends IconProps {}

export const FormattingIcon: React.FC<FormattingIconProps> = (props) =>
  props.formatting.behavior.renderIcon?.(props) ?? <GenericIcon {...props} />;
