import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Edit} from './Edit';
import {isValid} from './util';
import type {IconProps, ToolbarSliceBehaviorData} from '../../../types';

const PaintbrushIcon = makeIcon({set: 'lucide', icon: 'paintbrush'});

export const behavior = {
  menu: {
    name: 'Color',
    icon: () => <PaintbrushIcon width={16} height={16} />,
  },
  validate: (formatting) => {
    const obj = formatting.conf()?.view() as {color: string};
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const color = obj.color || '';
    if (typeof color !== 'string' || !isValid(color)) return [{code: 'INVALID_COLOR'}];
    if (color.length < 4) return 'empty';
    return 'good';
  },
  previewText: (formatting) => {
    const data = formatting.conf()?.view() as {color: string};
    if (!data || typeof data !== 'object') return '';
    return data.color || '';
  },
  renderIcon: ({formatting}: IconProps) => {
    const color = String(formatting.conf()?.read('/color') || void 0);
    return <span style={{backgroundColor: color, display: 'inline-block', width: 16, height: 16, borderRadius: '50%'}} />;
  },
  View: () => null,
  Edit,
} satisfies ToolbarSliceBehaviorData;
