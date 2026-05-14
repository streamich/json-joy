import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import Icon__svg from 'iconista/lib/react/tabler/overline';

export const name = 'Overline';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.overline, name, {
  menuId: 'fmt-common',
  menu: () => ({
    name,
    order: 5,
    icon: () => <Icon width={16} height={16} />,
  }),
  text: (style) => {
    style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'overline';
  },
});
