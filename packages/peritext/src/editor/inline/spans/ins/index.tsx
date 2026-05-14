import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import {Ins} from './Ins';
import Icon__svg from 'iconista/lib/react/tabler/pencil-plus';

export const name = 'Insertion';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.ins, name, {
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 6,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <Ins>{children}</Ins>,
});
