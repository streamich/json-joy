import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {block} from '../util';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/tabler/h-4';

export const name = 'Heading 4';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = block(SliceTypeCon.h4, name, {
  // keys: ['Shift', 'Primary', '4'],
  menuId: 'block-h',
  menu: (state: EditorState) => ({
    name,
    order: 4,
    icon: () => <Icon width={16} height={16} />,
  }),
});
