import * as React from 'react';
import {makeRule, rule} from 'nano-theme';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import type {RenderNode} from '../../../../markdown/types';
import renderCodeDefault from '../../../../markdown/renderers/renderCode';
import {md} from '../../../../markdown/parser';
import Note from '../components/Note';
import Screenshot from '../components/Screenshot';
import Wide from '../components/Wide';
import Aside from '../components/Aside';

export const introClass = rule({
  fz: '0.9em',
  op: 0.9,
  pad: '0 0 16px',
  mar: '0 0 16px',
  lh: '1.5em',
  p: {
    lh: '1.5em',
  },
});

const useIntroColorsClass = makeRule((t) => ({
  col: t.g(0.5),
  bdb: `1px solid ${t.g(0.8)}`,
}));

const Intro: React.FC<{children: React.ReactNode}> = ({children}) => {
  const introColorsClass = useIntroColorsClass();
  return <div className={introClass + introColorsClass}>{children}</div>;
};

const renderCode: RenderNode = (renderers, flat, idx, props, state) => {
  const node = flat.nodes[idx] as ICode;
  const lang = node.lang;

  switch (lang) {
    case 'intro': {
      const ast = md(node.value);
      return <Intro>{renderers.node(renderers, ast, 0, props, state)}</Intro>;
    }
    case 'jj.note': {
      return <Note node={node} />;
    }
    case 'jj.screenshot': {
      const json = JSON.parse(node.value);
      return <Screenshot {...json} />;
    }
    case 'jj.wide': {
      return <Wide node={node} />;
    }
    case 'jj.aside': {
      return <Aside node={node} />;
    }
    default: {
      return renderCodeDefault(renderers, flat, idx, props, state);
    }
  }
};

export default renderCode;
