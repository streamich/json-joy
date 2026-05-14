import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import Icon__svg from 'iconista/lib/react/tabler/highlight';

export const name = 'Highlight';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.mark, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 6,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <mark>{children}</mark>,
});
