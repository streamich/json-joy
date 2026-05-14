import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/tabler/subscript';

export const name = 'Subscript';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = spanOne(SliceTypeCon.sub, name, {
  menuId: 'fmt-technical',
  menu: (state: EditorState) => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
  render: (children: React.ReactNode) => <sub>{children}</sub>,
});
