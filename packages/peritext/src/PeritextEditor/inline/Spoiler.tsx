import * as React from 'react';
import {rule} from 'nano-theme';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';

const blockClass = rule({
  bg: '#222',
  col: 'transparent',
  bdrad: 'calc(min(2px, 0.15em))',
});

export interface SpoilerProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {attr, children} = props;
  const slice = attr.slice;
  const editor = slice.txt.editor;
  const cursor = editor.cursorCount() === 1 ? editor.cursor : void 0;
  
  let isRevealed = false;
  const style: React.CSSProperties = {};
  if (cursor) {
    isRevealed = slice.containsPoint(cursor.focus());
    if (isRevealed) {
      style.backgroundColor = 'rgba(127,127,127,.2)';
      style.color = 'inherit';
    }
  }

  return <span className={blockClass} style={style}>{children}</span>;
};
