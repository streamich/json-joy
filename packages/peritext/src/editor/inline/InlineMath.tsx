import 'mathlive';
import * as React from 'react';
import {rule} from 'nano-theme';
import {Char} from '../../web/constants';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

// TODO: load these once?
// or: https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const wrapClass = rule({
  // d: 'inline-flex',
  // ai: 'center',
  // verticalAlign: 'middle',
  cursor: 'default',
  userSelect: 'none',
});

const mathClass = rule({
  cur: 'pointer',
  bd: '1px solid red',
});

export interface InlineMathProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const InlineMath = ({attr, children}: InlineMathProps) => {
  if (attr.isStart()) {
    const tex = (attr.slice as unknown as Slice<string>).text?.() ?? '';
    const content = tex || '\\placeholder{}';

    let html = '';
    try {
      return (
        // <span dangerouslySetInnerHTML={{__html: convertLatexToMarkup(tex || '\\placeholder{}')}} />
        // <math-span>{content}</math-span>
        <span className={mathClass}>
          {React.createElement('math-span', {mode: "textstyle"}, content)}
        </span>
      );
    } catch {}
  }

  return Char.ZeroLengthSpace;
};
