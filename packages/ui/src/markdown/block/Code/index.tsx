import * as React from 'react';
import type {IMarkdownBlockCodeProps} from '../shared';
import {context} from '../../context';
import type {ICode} from 'very-small-parser/lib/markdown/block/types';
import type {TNode} from 'mdast-flat/lib/types';
import MarkdownBlock from '../../util/MarkdownBlock';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import HighlightCode from '../../../1-inline/HighlightCode';
import {lightTheme, rule, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const blockClass = drule({
  ...lightTheme.font.mono,
  d: 'block',
  bdrad: '5px',
  trs: 'background 0.6s ease 0s',
  fz: '.9em',
  lh: 1.3,
  overflowY: 'hidden',
  bd: '1px solid transparent',
  pad: '16px !important',
  '@media (max-width: 800px)': {
    pad: '8px !important',
  },
});

const blockCompactClass = rule({
  pad: `${lightTheme.g(0.2)}px ${lightTheme.g(0.3)}px !important`,
});

const {useContext} = React;

const Code: React.FC<IMarkdownBlockCodeProps> = ({idx}) => {
  const styles = useStyles();
  const cls = blockClass({
    col: styles.g(0.3),
    bg: styles.g(0, 0.02),
    '&:hover': {
      bg: styles.bg + '',
      bd: `1px solid ${styles.g(0, 0.04)}`,
    },
  });
  const {ast, props} = useContext(context);
  const node = ast.nodes[idx] as ICode;
  const {lang, value} = node;
  const lines = (value.match(/\n/g) || '').length + 1;
  const charsPerLine = value.length / lines;

  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(node as TNode, ast);
  const makeWide = charsPerLine > 50 || (charsPerLine > 40 && lines > 3);
  const blockStyle: React.CSSProperties = {};

  const element = (
    <MarkdownBlock
      idx={idx}
      as="pre"
      className={cls + (props.isCompact ? ' ' + blockCompactClass : '')}
      style={blockStyle}
    >
      {lang ? <HighlightCode code={value} lang={lang || undefined} /> : <code>{value}</code>}
    </MarkdownBlock>
  );

  return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock wide={makeWide}>{element}</MarkdownFullWidthBlock> : element;
};

export default Code;
