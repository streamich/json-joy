import * as React from 'react';
import {makeRule, rule} from 'nano-theme';
import type {InlineAttr} from 'json-joy/lib/json-crdt-extensions';

const useBlockClass = makeRule((t) => {
  const shade = t.isLight ? 0 : 1;
  return {
    ...t.font.mono.mid,
    mrt: '-.3em',
    pdt: '.3em',
    pdb: '.3em',
    bg: t.g(0.2),
    bdt: `1px solid ${t.g(0.3)}`,
    bdb: `2px solid ${t.g(0)}`,
    lh: '1em',
    fz: '.7em',
    ws: 'nowrap',
    bxsh: `0 0 .125em ${t.g(shade, 0.5)},0 .065em .19em ${t.g(shade, 0.5)},.065em 0 .125em ${t.g(shade, 0.2)}`,
    col: '#fff',
  };
});

const startClass = rule({
  pdl: '.7em',
  borderTopLeftRadius: '.3em',
  borderBottomLeftRadius: '.3em',
});

const useEndClass = makeRule((t) => ({
  pdr: 'calc(.7em - 2px)',
  borderTopRightRadius: '.3em',
  borderBottomRightRadius: '.3em',
  bdr: `2px solid ${t.g(0.1)}`,
}));

export interface KbdProps {
  attr: InlineAttr;
  children: React.ReactNode;
}

export const Kbd: React.FC<KbdProps> = (props) => {
  const {attr, children} = props;
  const blockClass = useBlockClass();
  const endClass = useEndClass();
  const className = blockClass + (attr.isStart() ? startClass : '') + (attr.isEnd() ? endClass : '');

  return <kbd className={className}>{children}</kbd>;
};
