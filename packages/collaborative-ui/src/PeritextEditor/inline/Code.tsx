import * as React from 'react';
import {rule, drule, theme, useTheme} from 'nano-theme';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';

const blockClass = drule({
  ...theme.font.mono.mid,
  fz: '.9em',
  pdt: '.05em',
  pdb: '.05em',
});

const startClass = rule({
  borderTopLeftRadius: '.3em',
  borderBottomLeftRadius: '.3em',
  pdl: '.24em',
});

const endClass = rule({
  borderTopRightRadius: '.3em',
  borderBottomRightRadius: '.3em',
  pdr: '.24em',
});

export interface CodeProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const Code: React.FC<CodeProps> = (props) => {
  const {children, attr} = props;
  const theme = useTheme();
  const className =
    blockClass({
      bg: theme.g(0.2, 0.1),
    }) +
    (attr.isStart() ? startClass : '') +
    (attr.isEnd() ? endClass : '');

  return <span className={className}>{children}</span>;
};
