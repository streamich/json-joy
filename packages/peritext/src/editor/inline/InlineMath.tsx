import * as React from 'react';
import {rule} from 'nano-theme';
import {convertLatexToMarkup} from 'mathlive';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

// TODO: load these once?
import 'mathlive/fonts.css';
import 'mathlive/static.css';

const wrapClass = rule({
  d: 'inline-flex',
  ai: 'center',
  verticalAlign: 'middle',
  cursor: 'default',
  userSelect: 'none',
});

/** Characters are hidden but kept in DOM so the CRDT cursor positions remain valid. */
const hiddenStyle: React.CSSProperties = {
  fontSize: '0.1px',
  color: 'transparent',
  lineHeight: 0,
  userSelect: 'none',
  pointerEvents: 'none',
  display: 'inline',
};

export interface InlineMathProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const InlineMath = ({attr, children}: InlineMathProps) => {
  if (attr.isStart()) {
    const tex = (attr.slice as unknown as Slice<string>).text?.() ?? '';
    let html = '';
    try {
      html = convertLatexToMarkup(tex || '\\placeholder{}');
    } catch {
      html = tex;
    }
    return (
      <span className={wrapClass}>
        <span
          dangerouslySetInnerHTML={{__html: html}}
        />
        <span style={hiddenStyle}>{children}</span>
      </span>
    );
  }

  // Non-start fragments: keep characters in DOM for cursor tracking, but invisible.
  return <span style={hiddenStyle}>{children}</span>;
};
