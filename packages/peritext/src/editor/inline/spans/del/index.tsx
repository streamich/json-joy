import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import {Del} from './Del';
import Icon__svg from 'iconista/lib/react/tabler/pencil-minus';

export const name = 'Deletion';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.del, name, {
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 7,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <Del>{children}</Del>,
});
