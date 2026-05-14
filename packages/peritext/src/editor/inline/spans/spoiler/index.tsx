import * as React from 'react';
import {type InlineAttrStack, SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import {Spoiler} from './Spoiler';
import Icon__svg from 'iconista/lib/react/tabler/lock-password';

export const name = 'Spoiler';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.spoiler, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 7,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode, attr: InlineAttrStack) => (
    <Spoiler attr={attr[attr.length - 1]}>{children}</Spoiler>
  ),
});
