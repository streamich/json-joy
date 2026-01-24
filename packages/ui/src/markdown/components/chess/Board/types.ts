export type TPieceColor = 'b' | 'w';
export type TPieceType = 'r' | 'b' | 'k' | 'n' | 'p' | 'q' | 'R' | 'B' | 'K' | 'N' | 'P' | 'Q';
export type TSquarePositionComponent = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type TPieceNames = 'br' | 'bb' | 'bk' | 'bn' | 'bp' | 'bq' | 'wr' | 'wb' | 'wk' | 'wn' | 'wp' | 'wq';
export type TLineBody = string | '-' | '--' | '---' | '----' | '-----' | '=' | '==' | '===' | '====' | '=====';
export type TLineTip =
  | string
  | ''
  | '>'
  | '>>'
  | '>>>'
  | '>>>>'
  | '>>>>>'
  | '<'
  | '<<'
  | '<<<'
  | '<<<<'
  | '<<<<<'
  | 'o'
  | 'O';

export interface ILine {
  from: [TSquarePositionComponent, TSquarePositionComponent];
  to: [TSquarePositionComponent, TSquarePositionComponent];
  body?: TLineBody;
  tipTo?: TLineTip;
  tipFrom?: TLineTip;
  color?: string;
  opacity?: number;
}

export interface ISquare {
  xy: [TSquarePositionComponent, TSquarePositionComponent];
  piece?: TPieceType;
  pieceOpacity?: number;
  color?: string;
  opacity?: number;
  borderTop?: boolean;
  borderRight?: boolean;
  borderBottom?: boolean;
  borderLeft?: boolean;
}

export interface IBorder {
  xy: [TSquarePositionComponent, TSquarePositionComponent];
  segments: string;
  offset?: [number, number];
  segmentSize?: number;
  color?: string;
  opacity?: number;
  width?: number;
  fillColor?: string;
  fillOpacity?: number;
}

export interface IBoardLayout {
  lines?: ILine[];
  squares?: ISquare[];
  borders?: IBorder[];
}
