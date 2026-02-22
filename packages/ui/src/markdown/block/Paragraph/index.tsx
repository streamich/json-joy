import * as React from 'react';
import {context} from '../../context';
import MarkdownBlock from '../../util/MarkdownBlock';
import {rule, m2, m1, theme, useTheme} from 'nano-theme';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';

const {memo, useContext} = React;

const paragraphClass = rule({
  ...theme.font.sans,
  lh: 1.7,
  fz: '1em',
  [m2]: {
    lh: 1.6,
  },
  [m1]: {
    lh: 1.5,
    ta: 'initial',
  },
});

const paragraphCompactClass = rule({
  lh: 1.45,
});

interface Props {
  idx: number;
  children?: React.ReactNode;
}

const Paragraph: React.FC<Props> = memo(({idx, children}) => {
  const {ast, props} = useContext(context);
  const theme = useTheme();

  const root = ast.nodes[0];
  const blockCount = root.children ? root.children.length : 0;
  const node = ast.nodes[idx];
  const isFirstLevelBlock = isFirstLevelBlockElement(node, ast);

  const style: React.CSSProperties = {
    color: theme.g(0, 0.8),
  };

  if (props.isFullWidth && blockCount === 1) {
    // Is like a tweet. Add extra character in case of newline.
    if ((root.len || 0) <= 141) {
      style.fontSize = '1.3em';
    } else if ((root.len || 0) <= 281) {
      style.fontSize = '1.2em';
    }
  }

  if (props.isFullWidth && (root.len || 0) <= 10) {
    // Looks nice with emojis.
    style.textAlign = 'center';
    style.fontSize = '2em';
  }

  const paragraph = (
    <MarkdownBlock
      as="p"
      idx={idx}
      className={paragraphClass + (props.isCompact ? paragraphCompactClass : '')}
      style={style}
    >
      {children}
    </MarkdownBlock>
  );
  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlock;
  return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock>{paragraph}</MarkdownFullWidthBlock> : paragraph;
});

export default Paragraph;
