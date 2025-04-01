// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {Spoiler} from './Spoiler';
import {Code} from './Code';
import {Kbd} from './Kbd';
import {Ins} from './Ins';
import {Del} from './Del';
import type {InlineViewProps} from '../../../web/react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;
  const attrs = inline.attr();
  let element = children;
  if (attrs[CommonSliceType.mark]) element = <mark>{element}</mark>;
  if (attrs[CommonSliceType.sup]) element = <sup>{element}</sup>;
  if (attrs[CommonSliceType.sub]) element = <sub>{element}</sub>;
  if (attrs[CommonSliceType.math]) element = <code>{element}</code>;
  if (attrs[CommonSliceType.ins]) element = <Ins>{element}</Ins>;
  if (attrs[CommonSliceType.del]) element = <Del>{element}</Del>;
  if (attrs[CommonSliceType.code]) {
    const attr = attrs[CommonSliceType.code][0];
    if (attr) element = <Code attr={attr}>{element}</Code>;
  }
  if (attrs[CommonSliceType.kbd]) {
    const attr = attrs[CommonSliceType.kbd][0];
    if (attr) element = <Kbd attr={attr}>{element}</Kbd>;
  }
  if (attrs[CommonSliceType.spoiler]) element = <Spoiler>{element}</Spoiler>;
  return element;
};
