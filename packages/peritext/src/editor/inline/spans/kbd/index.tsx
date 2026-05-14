import * as React from 'react';
import {type InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import {Kbd} from './Kbd';
import Icon__svg from 'iconista/lib/react/lucide/keyboard';

export const name = 'Keyboard key';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.kbd, name, {
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) => <Kbd attr={attr[attr.length - 1]}>{children}</Kbd>,
});
