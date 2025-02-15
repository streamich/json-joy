import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {InlineAttr} from '../../../../json-crdt-extensions';

const blockClass = rule({
  ...theme.font.mono.mid,
  fz: '.88em',
  bg: '#eee',
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
  const className = blockClass + (attr.isStart() ? startClass : '') + (attr.isEnd() ? endClass : '');

  return (
    <span className={className}>{children}</span>
  );
};
