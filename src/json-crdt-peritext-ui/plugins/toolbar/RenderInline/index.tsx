// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {Spoiler} from './Spoiler';
import type {InlineViewProps} from '../../../react/InlineView';

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;
  const attr = inline.attr();
  let element = children;
  if (attr[CommonSliceType.code]) element = <code>{element}</code>;
  if (attr[CommonSliceType.mark]) element = <mark>{element}</mark>;
  if (attr[CommonSliceType.del]) element = <del>{element}</del>;
  if (attr[CommonSliceType.ins]) element = <ins>{element}</ins>;
  if (attr[CommonSliceType.sup]) element = <sup>{element}</sup>;
  if (attr[CommonSliceType.sub]) element = <sub>{element}</sub>;
  if (attr[CommonSliceType.math]) element = <code>{element}</code>;
  if (attr[CommonSliceType.kbd]) element = <kbd>{element}</kbd>;
  if (attr[CommonSliceType.spoiler]) element = <Spoiler>{element}</Spoiler>;
  return element;
};
