import * as React from 'react';
import {lightTheme, rule} from 'nano-theme';
import {useStyles} from '../../../styles/context';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';
import MarkdownBlock from '../../util/MarkdownBlock';
import {context} from '../../context';
import {useContentSize} from '../../../context/content-size';

const {useContext} = React;

const headingClass = rule({
  ...lightTheme.font.ui2.lite,
});

export interface HeadingProps {
  idx: number;
  children?: React.ReactNode;
}

const Heading: React.FC<HeadingProps> = ({idx, children}) => {
  const styles = useStyles();
  const {ast, props} = useContext(context);
  const {width} = useContentSize();
  // const slug = React.useMemo(() => slugify());

  const node = ast.nodes[idx];
  const headingLevel = (node as any).depth;
  const Tag = `h${headingLevel}` as any;

  const fontSizeFactor = width > 1_200 ? 1 : width > 1_000 ? 0.9 : width > 800 ? 0.8 : 0.7;
  const style: React.CSSProperties = {
    fontSize: fontSizeFactor * (props.isCompact ? 1.14 : 1.24) ** (6 - headingLevel) + 'em',
    // letterSpacing: width > 800 ? (headingLevel - 5) * (props.isCompact ? 0.5 : 1) + 'px' : '0px',
    color: styles.light ? `rgba(0,0,0,${1 - headingLevel / 15})` : `rgba(255,255,255,${1 - headingLevel / 15})`,
    lineHeight: width > 800 ? 1.2 : 1.1,
  };

  if (!props.isCompact && idx > 1) {
    style.paddingTop = '0.5em';
  }

  const element = (
    <MarkdownBlock idx={idx}>
      <Tag className={headingClass} style={style}>
        {children}
      </Tag>
    </MarkdownBlock>
  );
  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(node, ast);

  return doCenterAsTopLevelBlock ? <MarkdownFullWidthBlock>{element}</MarkdownFullWidthBlock> : element;
};

export default Heading;
