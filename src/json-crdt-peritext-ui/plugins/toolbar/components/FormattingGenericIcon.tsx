import * as React from 'react';
import {Avatar} from 'nice-ui/lib/1-inline/Avatar';
import type {SliceFormatting} from '../state/formattings';

export interface FormattingGenericIconProps {
  formatting: SliceFormatting;
}

export const FormattingGenericIcon: React.FC<FormattingGenericIconProps> = ({formatting}) => {
  const data = formatting.behavior.data();
  const id = formatting.range.id;
  const time = id.time + '';
  const name = data?.previewText?.(formatting) || (time[time.length - 1] + time[time.length - 2] + time + '.' + id.sid);

  return (
    <Avatar name={name} width={16} height={16} />
  );
};
