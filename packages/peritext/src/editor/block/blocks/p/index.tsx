import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {block} from '../util';
import Icon__svg from 'iconista/lib/react/lucide/pilcrow';

export const name = 'Paragraph';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = block(SliceTypeCon.p, name, {
  keys: ['Shift', 'Primary', '0'],
  menuId: 'block-text',
  menu: {
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
  },
});
