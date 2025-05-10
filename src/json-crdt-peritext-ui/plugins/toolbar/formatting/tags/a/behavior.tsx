import * as React from 'react';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {Sidetip} from 'nice-ui/lib/1-inline/Sidetip';
import {renderIcon} from './renderIcon';
import {View} from './View';
import {Edit} from './Edit';
import type {ToolbarSliceBehaviorData} from '../../../types';
import {getDomain} from '../../../../../web/util';

export const behavior = {
  menu: {
    name: 'Link',
    icon: () => <Iconista width={15} height={15} set="lucide" icon="link" />,
    // icon: () => <Iconista width={15} height={15} set="radix" icon="link-2" />,
    right: () => <Sidetip small>⌘ K</Sidetip>,
    keys: ['⌘', 'k'],
  },
  validate: (formatting) => {
    const obj = formatting.conf()?.view() as {href: string};
    if (!obj || typeof obj !== 'object') return [{code: 'INVALID_CONFIG'}];
    const href = obj.href || '';
    if (typeof href !== 'string') return [{code: 'INVALID_URL'}];
    if (href.length < 4) return 'empty';
    const domain = getDomain(href);
    return domain ? 'good' : 'fine';
  },
  previewText: (formatting) => {
    const data = formatting.conf()?.view() as {href: string};
    if (!data || typeof data !== 'object') return '';
    return (data.href || '').replace(/^(https?:\/\/)?(www\.)?/, '');
  },
  renderIcon,
  Edit,
  View,
} satisfies ToolbarSliceBehaviorData;
