import * as React from 'react';
import {Spoiler} from './Spoiler';
import {Code} from './Code';
import {InlineMath} from './InlineMath';
import {Kbd} from './Kbd';
import {Ins} from './Ins';
import {Del} from './Del';
import {Link} from './Link';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {InlineViewProps} from '../../web/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;
  const attrs = inline.attr();
  let element = children;
  const a = attrs[SliceTypeCon.a];
  if (a)
    element = (
      <Link layers={a.length} stack={a}>
        {element}
      </Link>
    );
  if (attrs[SliceTypeCon.mark]) element = <mark>{element}</mark>;
  if (attrs[SliceTypeCon.sup]) element = <sup>{element}</sup>;
  if (attrs[SliceTypeCon.sub]) element = <sub>{element}</sub>;
  if (attrs[SliceTypeCon.ins]) element = <Ins>{element}</Ins>;
  if (attrs[SliceTypeCon.del]) element = <Del>{element}</Del>;

  // TODO: for exclusive layers, only render one decoration.

  let layers = attrs[SliceTypeCon.code];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Code attr={attr}>{element}</Code>;
  }
  layers = attrs[SliceTypeCon.math];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <InlineMath attr={attr}>{element}</InlineMath>;
  }
  layers = attrs[SliceTypeCon.kbd];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Kbd attr={attr}>{element}</Kbd>;
  }
  layers = attrs[SliceTypeCon.spoiler];
  if (layers) {
    const attr = layers[layers.length - 1];
    if (attr) element = <Spoiler attr={attr}>{element}</Spoiler>;
  }
  return element;
};
