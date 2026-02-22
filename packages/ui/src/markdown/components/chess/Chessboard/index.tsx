import * as React from 'react';
import {rule} from 'nano-theme';
import Board, {type BoardProps} from '../Board';

const blockClass = rule({
  // w: '80%',
  maxW: '600px',
  'min-width': '130px',
  mar: '0 auto',
  bdrad: '3px',
  ov: 'hidden',
  svg: {
    d: 'block',
  },
  '.chess-board': {
    bdr: '1px solid rgba(0,0,0,.15)',
    bdl: '1px solid rgba(0,0,0,.1)',
    bdb: '1px solid rgba(0,0,0,.2)',
    bdt: '1px solid rgba(0,0,0,.1)',
    bdrad: '3px',
    boxShadow: '0 1px 4px rgba(0,0,0,.13)',
    bg: '#eee',
    pos: 'relative',
    ov: 'hidden',
    w: '100%',
    '&:after': {
      content: '""',
      d: 'block',
      padb: '100%',
    },
  },
  '@media (max-width: 600px)': {
    '.chess-grid': {
      d: 'none',
    },
  },
});

interface ChessboardProps extends BoardProps {}

const Chessboard: React.FC<ChessboardProps> = ({...boardProps}) => {
  return (
    <div className={blockClass}>
      <Board {...boardProps} />
    </div>
  );
};

export default Chessboard;
