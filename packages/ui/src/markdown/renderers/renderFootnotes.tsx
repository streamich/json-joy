import * as React from 'react';
import type {RenderNode} from '../types';
import {rule, drule, useTheme} from 'nano-theme';

const blockCss = drule({
  mar: '32px 0 0',
  pad: '32px 0 0',
  w: '100%',
  fz: '.75em',
});

const tableClass = rule({
  w: '100%',
});

// TODO: `Footnotes` is not an MDAST node, this should probably be a component
// TODO: instead of a renderer.
const renderFootnotes: RenderNode = (renderers, flat, idx, props, state) => {
  const theme = useTheme();
  if (!flat.footnoteOrder.length) return null;

  const blockClass = blockCss({
    bdt: `1px solid ${theme.g(0, 0.04)}`,
    '&:hover': {
      bdt: `1px solid ${theme.g(0, 0.1)}`,
    },
  });

  return (
    <div className={blockClass}>
      <table className={tableClass}>
        <tbody>
          {flat.footnoteOrder.map((idx) => renderers.footnoteDefinition(renderers, flat, idx, props, state))}
        </tbody>
      </table>
    </div>
  );
};

export default renderFootnotes;
