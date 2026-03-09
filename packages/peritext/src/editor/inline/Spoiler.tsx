import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';

const blockClass = drule({
  bg: '#222',
  col: 'transparent',
});

const radius = 'calc(min(3px,.15em))';

const startClass = rule({
  borderTopLeftRadius: radius,
  borderBottomLeftRadius: radius,
});

const endClass = rule({
  borderTopRightRadius: radius,
  borderBottomRightRadius: radius,
});

export interface SpoilerProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {attr, children} = props;
  const theme = useTheme();

  const slice = attr.slice;
  const editor = slice.txt.editor;
  const cursor = editor.cursorCount() === 1 ? editor.cursor : void 0;

  let isRevealed = false;
  if (cursor) {
    isRevealed = slice.containsPoint(cursor.focus());
  }

  const className =
    blockClass({
      bg: isRevealed ? theme.g(0.2, 0.1) : '#222',
      col: isRevealed ? 'inherit' : 'transparent',
      '& *': {
        col: isRevealed ? 'inherit' : 'transparent',
      },
    }) +
    (attr.isStart() ? startClass : '') +
    (attr.isEnd() ? endClass : '');

  return <span className={className}>{children}</span>;
};
