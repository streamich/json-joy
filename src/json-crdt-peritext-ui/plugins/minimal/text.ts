import type * as React from 'react';
import {CommonSliceType} from '../../../json-crdt-extensions';
import type {PeritextPlugin} from '../../web/react/types';
import type {InlineAttrStack} from '../../../json-crdt-extensions/peritext/block/Inline';

export const text: PeritextPlugin['text'] = (props, inline) => {
  const style = (props.style || (props.style = {})) as React.CSSProperties;
  const attrs = inline.attr();

  let textDecoration = '';
  let attr: InlineAttrStack | undefined;

  if (attrs[CommonSliceType.b]) style.fontWeight = 'bold';
  if (attrs[CommonSliceType.i]) style.fontStyle = 'italic';
  if (attrs[CommonSliceType.u]) textDecoration = 'underline';
  if (attrs[CommonSliceType.overline]) textDecoration = textDecoration ? textDecoration + ' overline' : 'overline';
  if (attrs[CommonSliceType.s]) textDecoration = textDecoration ? textDecoration + ' line-through' : 'line-through';
  if ((attr = attrs[CommonSliceType.col])) style.color = attr[0].slice.data() + '';

  style.textDecoration = textDecoration;

  return props;
};
