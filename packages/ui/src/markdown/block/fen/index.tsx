import * as React from 'react';
import type {IMarkdownBlockCodeProps} from '../shared';
import {parseExtended} from './parser';
import Chessboard from '../../components/chess/Chessboard';
import MarkdownBlock from '../../util/MarkdownBlock';
import {context} from '../../context';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import FullWidthFenBlock from './FullWidthFenBlock';

const {memo, useMemo, useContext} = React;

const FenBlock: React.FC<IMarkdownBlockCodeProps> = memo((props) => {
  const {idx, source, renderError} = props;
  const state = useContext(context);
  const node = state.ast.nodes[idx];

  const parsed = useMemo(() => {
    try {
      return parseExtended(source);
    } catch (_error) {
      return null;
    }
  }, [source]);

  if (!parsed) {
    return <>{renderError(props, new Error('Could not parse.'))}</>;
  }

  const doCenterAsTopLevelBlock = state.props.isFullWidth && isFirstLevelBlockElement(node, state.ast);
  if (doCenterAsTopLevelBlock) {
    return <FullWidthFenBlock idx={idx} layout={parsed} />;
  }

  let chessboard = <Chessboard {...parsed} />;

  if (state.props.isCompact) {
    chessboard = <div style={{maxWidth: 300, margin: '0 auto'}}>{chessboard}</div>;
  }

  return <MarkdownBlock idx={idx}>{chessboard}</MarkdownBlock>;
});

export default FenBlock;
