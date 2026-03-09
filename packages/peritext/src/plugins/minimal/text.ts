import type * as React from 'react';
import {SliceTypeCon} from 'json-joy/lib/json-crdt-extensions/peritext/slice/constants';
import type {PeritextPlugin} from '../../web/react/types';
import type {InlineAttrStack} from 'json-joy/lib/json-crdt-extensions/peritext/block/Inline';

export const text: PeritextPlugin['text'] = (props, inline) => {
  const style = (props.style || (props.style = {})) as React.CSSProperties;
  const attrs = inline.attr();

  let textDecoration = '';
  let attr: InlineAttrStack | undefined;

  if (attrs[SliceTypeCon.b]) style.fontWeight = 'bold';
  if (attrs[SliceTypeCon.i]) style.fontStyle = 'italic';
  if (attrs[SliceTypeCon.u]) textDecoration = 'underline';
  if (attrs[SliceTypeCon.overline]) textDecoration = textDecoration ? textDecoration + ' overline' : 'overline';
  if (attrs[SliceTypeCon.s]) textDecoration = textDecoration ? textDecoration + ' line-through' : 'line-through';
  if ((attr = attrs[SliceTypeCon.col])) {
    const data = attr[0].slice.data();
    const color: string | undefined = typeof data === 'object' && data ? String((data as any).col) : void 0;
    if (color) style.color = color;
  }

  style.textDecoration = textDecoration;

  return props;
};
