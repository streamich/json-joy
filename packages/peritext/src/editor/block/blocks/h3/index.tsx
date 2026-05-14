import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {block} from '../util';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/tabler/h-3';

export const name = 'Heading 3';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = block(SliceTypeCon.h3, name, {
  // keys: ['Shift', 'Primary', '3'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 3,
    icon: () => <Icon width={16} height={16} />,
  }),
});
