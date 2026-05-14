import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import Icon__svg from 'iconista/lib/react/tabler/superscript';

export const name = 'Superscript';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.sup, name, {
  menuId: 'fmt-technical',
  menu: () => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <sup>{children}</sup>,
});
