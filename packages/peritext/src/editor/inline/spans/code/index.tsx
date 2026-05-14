import * as React from 'react';
import {type InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import {Code} from './Code';
import Icon__svg from 'iconista/lib/react/tabler/code';

export const name = 'Code';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.code, name, {
  keys: ['Primary', 'e'],
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 1,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) => <Code attr={attr[attr.length - 1]}>{children}</Code>,
});
