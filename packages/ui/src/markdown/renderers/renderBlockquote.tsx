import * as React from 'react';
import {rule, drule, m1, useTheme} from 'nano-theme';
import MarkdownFullWidthBlock from '../util/MarkdownFullWidthBlock';
import isFirstLevelBlockElement from '../util/isFirstLevelBlockElement';
import MarkdownBlock from '../util/MarkdownBlock';
import type {RenderNode} from '../types';

const blockquoteClass = rule({
  pad: '0 0 0 16px !important',
  mar: '2px 0 2px 16px !important',
  trs: 'border 0.2s',
  [m1]: {
    mar: '0 !important',
    pad: '0 0 0 12px !important',
  },
});

const renderBlockquote: RenderNode = (renderers, ast, idx, props, state) => {
  const theme = useTheme();
  const dynamicBlockquoteClass = drule({
    bdl: `6px solid ${theme.g(0, 0.08)}`,
    '&:hover': {
      bdl: `6px solid ${theme.g(0, 0.16)}`,
    },
  });

  const element = (
    <MarkdownBlock idx={idx}>
      <blockquote className={blockquoteClass + dynamicBlockquoteClass}>
        {renderers.children(renderers, ast, idx, props, state)}
      </blockquote>
    </MarkdownBlock>
  );
  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(ast.nodes[idx], ast);
  return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock>{element}</MarkdownFullWidthBlock> : element;
};

export default renderBlockquote;
