import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import MarkdownBlock from '../../util/MarkdownBlock';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import {useMarkdown} from '../../context';

const blockClass = rule({
  bd: 0,
  bdrad: '2px',
  mar: '64px 0',
  h: '2px',
});

export interface Props {
  idx: number;
}

const Hr: React.FC<Props> = React.memo(({idx}) => {
  const {ast, props} = useMarkdown();
  const theme = useTheme();

  const node = ast.nodes[idx];
  const element = <MarkdownBlock idx={idx} as="hr" className={blockClass} style={{background: theme.g(0.2, 0.1)}} />;

  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(node, ast);
  return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock>{element}</MarkdownFullWidthBlock> : element;
});

export default Hr;
