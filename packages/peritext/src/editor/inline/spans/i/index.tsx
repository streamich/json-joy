import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import Icon__svg from 'iconista/lib/react/lucide/italic';

export const name = 'Italic';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.i, name, {
  keys: ['Primary', 'i'],
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 2,
    icon: () => <Icon width={14} height={14} />,
  }),
  text: (style) => {
    style.fontStyle = 'italic';
  },
});
