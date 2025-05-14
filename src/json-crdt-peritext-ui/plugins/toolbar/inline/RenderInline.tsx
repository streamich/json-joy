// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {Spoiler} from './Spoiler';
import {Code} from './Code';
import {Kbd} from './Kbd';
import {Ins} from './Ins';
import {Del} from './Del';
import {Link} from './Link';
import {SliceTypeCon} from '../../../../json-crdt-extensions/peritext/slice/constants';
import type {InlineViewProps} from '../../../web/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;
  const attrs = inline.attr();
  let element = children;
  const a = attrs[SliceTypeCon.a];
  if (a) element = <Link layers={a.length} stack={a}>{element}</Link>;
  if (attrs[SliceTypeCon.mark]) element = <mark>{element}</mark>;
  if (attrs[SliceTypeCon.sup]) element = <sup>{element}</sup>;
  if (attrs[SliceTypeCon.sub]) element = <sub>{element}</sub>;
  if (attrs[SliceTypeCon.math]) element = <code>{element}</code>;
  if (attrs[SliceTypeCon.ins]) element = <Ins>{element}</Ins>;
  if (attrs[SliceTypeCon.del]) element = <Del>{element}</Del>;
  if (attrs[SliceTypeCon.code]) {
    const attr = attrs[SliceTypeCon.code][0];
    if (attr) element = <Code attr={attr}>{element}</Code>;
  }
  if (attrs[SliceTypeCon.kbd]) {
    const attr = attrs[SliceTypeCon.kbd][0];
    if (attr) element = <Kbd attr={attr}>{element}</Kbd>;
  }
  if (attrs[SliceTypeCon.spoiler]) element = <Spoiler>{element}</Spoiler>;
  return element;
};
