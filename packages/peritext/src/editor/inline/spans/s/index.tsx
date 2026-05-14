import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import Icon__svg from 'iconista/lib/react/tabler/strikethrough';

export const name = 'Strikethrough';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.s, name, {
  keys: ['Shift', 'Primary', 'x'],
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'line-through';
  },
});
