import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {block} from '../util';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/lucide/type';

export const name = 'Title';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = block(SliceTypeCon.title, name, {
  // keys: ['Shift', 'Primary', '6'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 7,
    sepBefore: true,
    icon: () => <Icon width={16} height={16} />,
  }),
});
