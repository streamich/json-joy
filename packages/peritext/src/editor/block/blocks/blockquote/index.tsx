import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {block} from '../util';
import type {EditorState} from '../../../state';
import Icon__svg from 'iconista/lib/react/lucide/quote';

export const name = 'Blockquote';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
export const behavior = block(SliceTypeCon.blockquote, name, {
  keys: ['Shift', 'Primary', '1'],
  menuId: 'block-text',
  menu: (state: EditorState) => ({
    name,
    order: 2,
    icon: () => <Icon width={16} height={16} />,
  }),
});
