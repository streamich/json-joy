import * as React from 'react';
import {Avatar} from 'nice-ui/lib/1-inline/Avatar';
import type {FormattingIconProps} from './FormattingIcon';

export interface GenericIconProps extends FormattingIconProps {}

export const GenericIcon: React.FC<GenericIconProps> = ({formatting}) => {
  const data = formatting.behavior.data();
  const id = formatting.range.start.id;
  const time = id.time + '';
  const name = data?.previewText?.(formatting) || (time[time.length - 1] + time[time.length - 2] + time + '.' + id.sid);

  return (
    <Avatar name={name} width={16} height={16} />
  );
};
