import * as React from 'react';
import {Spoiler} from './Spoiler';
import {Code} from './Code';
import {Kbd} from './Kbd';
import {Ins} from './Ins';
import {Del} from './Del';
import {Link} from './Link';
import {SliceTypeName} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {InlineViewProps} from '../../PeritextWebUi/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;
  const attrs = inline.attr();
  let element = children;
  const a = attrs[SliceTypeName.a];
  if (a)
    element = (
      <Link layers={a.length} stack={a}>
        {element}
      </Link>
    );
  if (attrs[SliceTypeName.mark]) element = <mark>{element}</mark>;
  if (attrs[SliceTypeName.sup]) element = <sup>{element}</sup>;
  if (attrs[SliceTypeName.sub]) element = <sub>{element}</sub>;
  if (attrs[SliceTypeName.math]) element = <code>{element}</code>;
  if (attrs[SliceTypeName.ins]) element = <Ins>{element}</Ins>;
  if (attrs[SliceTypeName.del]) element = <Del>{element}</Del>;
  if (attrs[SliceTypeName.code]) {
    const attr = attrs[SliceTypeName.code][0];
    if (attr) element = <Code attr={attr}>{element}</Code>;
  }
  if (attrs[SliceTypeName.kbd]) {
    const attr = attrs[SliceTypeName.kbd][0];
    if (attr) element = <Kbd attr={attr}>{element}</Kbd>;
  }
  if (attrs[SliceTypeName.spoiler]) element = <Spoiler>{element}</Spoiler>;
  return element;
};
