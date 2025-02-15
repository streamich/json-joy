// biome-ignore lint: React is used for JSX
import * as React from 'react';
import {rule, theme} from 'nano-theme';
import type {InlineAttr} from '../../../../json-crdt-extensions';

const blockClass = rule({
  ...theme.font.mono.mid,
  mrt: '-.3em',
  pdt: '.3em',
  pdb: '.3em',
  bg: theme.g(0.2),
  bdt: `1px solid ${theme.g(0.3)}`,
  bdb: `2px solid ${theme.g(0)}`,
  lh: '1em',
  fz: '.7em',
  ws: 'nowrap',
  bxsh: '0 0 .125em rgba(0,0,0,.5),0 .065em .19em rgba(0,0,0,.5),.065em 0 .125em rgba(0,0,0,.2)',
  col: '#fff',
});

const startClass = rule({
  pdl: '.7em',
  borderTopLeftRadius: '.3em',
  borderBottomLeftRadius: '.3em',
});

const endClass = rule({
  pdr: 'calc(.7em - 2px)',
  borderTopRightRadius: '.3em',
  borderBottomRightRadius: '.3em',
  bdr: `2px solid ${theme.g(0.1)}`,
});

export interface KbdProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = (props) => {
  const {attr, children} = props;
  const className = blockClass + (attr.isStart() ? startClass : '') + (attr.isEnd() ? endClass : '');

  return <kbd className={className}>{children}</kbd>;
};
