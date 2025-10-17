import * as React from 'react';
import type {IconProps} from '../../../types';
import {Favicon} from '../../../../../components/Favicon';

export const renderIcon = ({formatting}: IconProps) => {
  const data = formatting.conf()?.view() as {href: string};
  if (!data || typeof data !== 'object') return;
  const {href} = data;
  return href ? <Favicon url={data.href ?? ''} /> : null;
};
