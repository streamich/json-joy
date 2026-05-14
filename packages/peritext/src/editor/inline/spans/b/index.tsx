import * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions';
import {spanOne} from '../util';
import type {MenuItem} from '../../../types';
import Icon__svg from 'iconista/lib/react/radix/font-bold';

export const name = 'Bold';
export const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;

const icon = () => <Icon width={15} height={15} />;
const menu: MenuItem = {
  name,
  order: 1,
  icon,
};

export const behavior = spanOne(SliceTypeCon.b, name, {
  keys: ['Primary', 'b'],
  menuId: 'fmt-common',
  menu: () => ({...menu}),
  text: (style) => {
    style.fontWeight = 'bold';
  },
});
