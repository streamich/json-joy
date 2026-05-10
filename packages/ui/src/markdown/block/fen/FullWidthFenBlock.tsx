import * as React from 'react';
import Chessboard from '../../components/chess/Chessboard';
import MarkdownBlock from '../../util/MarkdownBlock';
import type {IBoardLayout} from '../../components/chess/Board/types';
import {rule} from 'nano-theme';
import {useStyles} from '../../../styles/context';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';

const {useState} = React;

const blockClass = rule({
  cur: 'pointer',
});

const wrapClass = rule({
  mar: '0 auto',
  pad: '16px 32px',
});

interface Props {
  idx: number;
  layout: IBoardLayout;
}

const FullWidthFenBlock: React.FC<Props> = (props) => {
  const {idx, layout} = props;

  const [full, setFull] = useState(false);
  const styles = useStyles();

  const blockStyle: React.CSSProperties = {};

  if (full) {
    blockStyle.background = styles.light ? styles.g(0.08) : styles.g(0.96);
  }

  const wrapStyle: React.CSSProperties = {
    maxWidth: full ? 600 : 300,
  };

  if (full) {
    wrapStyle.padding = '32px';
  }

  return (
    <MarkdownFullWidthBlock full>
      <MarkdownBlock idx={idx} className={blockClass} style={blockStyle} onClick={() => setFull((f) => !f)}>
        <div className={wrapClass} style={wrapStyle}>
          <Chessboard {...layout} />
        </div>
      </MarkdownBlock>
    </MarkdownFullWidthBlock>
  );
};

export default FullWidthFenBlock;
