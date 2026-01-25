import * as React from 'react';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {ToolbarSliceBehaviorData} from '../../../types';

export const behavior = {
  menu: {
    name: 'Color',
    icon: () => <Iconista width={16} height={16} set="lucide" icon="paintbrush" />,
  },
  validate: (formatting) => {
    const obj = formatting.conf()?.view() as {color: string};
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const color = obj.color || '';
    if (typeof color !== 'string') return [{code: 'INVALID_COLOR'}];
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return [{code: 'INVALID_COLOR'}];
    if (color.length < 4) return 'empty';
    return 'good';
  },
  previewText: (formatting) => {
    const data = formatting.conf()?.view() as {color: string};
    if (!data || typeof data !== 'object') return '';
    return data.color || '';
  },
} satisfies ToolbarSliceBehaviorData;
