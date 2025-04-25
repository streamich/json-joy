import * as React from 'react';
import {Avatar} from 'nice-ui/lib/1-inline/Avatar';
import type {Formatting} from '../state/Formatting';

export interface FormattingGenericIconProps {
  formatting: Formatting;
}

export const FormattingGenericIcon: React.FC<FormattingGenericIconProps> = ({formatting}) => {
  const data = formatting.behavior.data();
  const id = formatting.slice.id;
  const time = id.time + '';
  const name = data?.previewText?.(formatting) || (time[time.length - 1] + time[time.length - 2] + time + '.' + id.sid);

  return (
    <Avatar name={name} width={16} height={16} />
  );
};
