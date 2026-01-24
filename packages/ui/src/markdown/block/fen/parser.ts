import type {
  IBoardLayout,
  IBorder,
  ILine,
  TSquarePositionComponent,
  TLineTip,
  TLineBody,
  ISquare,
} from '../../components/chess/Board/types';

const letterToNumber = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  g: 6,
  h: 7,
};

const pieceName2Letter = {
  k: 'bk',
  q: 'bq',
  b: 'bb',
  n: 'bn',
  r: 'br',
  p: 'bp',
  K: 'wk',
  Q: 'wq',
  B: 'wb',
  N: 'wn',
  R: 'wr',
  P: 'wp',
};

const twoLetterToCased = {
  bk: 'k',
  bq: 'q',
  bb: 'b',
  bn: 'n',
  br: 'r',
  bp: 'p',
  wk: 'K',
  wq: 'Q',
  wb: 'B',
  wn: 'N',
  wr: 'R',
  wp: 'P',
};

const validFen = (fen: string): boolean => {
  if (typeof fen !== 'string') return false;

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  // FEN should be 8 sections separated by slashes
  const chunks = fen.split('/');
  if (chunks.length > 8) return false;

  // check the piece sections
  for (let i = 0; i < 8 && i < chunks.length; i++) {
    if (chunks[i].length > 8 || chunks[i].search(/[^kqrbnpKQRNBP1-8]/) !== -1) {
      return false;
    }
  }
  return true;
};

export const parse = (
  fen: string,
): [TSquarePositionComponent, TSquarePositionComponent, keyof typeof pieceName2Letter][] => {
  if (!validFen(fen)) return [];

  // cut off any move, castling, etc info from the end
  // we're only interested in position information
  fen = fen.replace(/ .+$/, '');

  const rows = fen.split('/');
  const pieces = [];

  for (let i = 0; i < 8 && i < rows.length; i++) {
    const row = rows[i].split('');
    let colIndex = 0;

    // loop through each character in the FEN section
    for (let j = 0; j < row.length; j++) {
      if (row[j].search(/[1-8]/) !== -1) {
        const emptySquares = parseInt(row[j], 10);
        colIndex += emptySquares;
      } else {
        let piece = row[j];
        if (piece.toLowerCase() === piece) piece = 'b' + piece.toLowerCase();
        else piece = 'w' + piece.toLowerCase();

        pieces.push([i, colIndex, piece]);
        colIndex++;
      }
    }
  }
  return pieces as any;
};

export const parseExtended = (fen: string, noFen = false): IBoardLayout => {
  const layout: IBoardLayout = {
    borders: [],
    lines: [],
    squares: [],
  };
  const parts = fen.split(/\n|;/g);

  if (!noFen) {
    const pieces = parse(parts[0]);
    if (pieces) {
      for (const [x, y, piece] of pieces) {
        layout.squares!.push({
          xy: [y, (7 - x) as any],
          piece: (twoLetterToCased as any)[piece],
        });
      }
    }
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Lines like: `e1->e4`
    let match = part.match(
      /^\s*([a-hA-H])([0-8])\s*(<{0,50}|[oO]{0,1})\s*([-=]{0,50})\s*(>{0,50}|[oO]{0,1})\s*([a-hA-H])([0-8])\s*:?\s*([a-zA-Z#0-9]+)?\s*,?\s*([0-9.]+)?\s*/, // eslint-disable-line
    );
    if (match) {
      const line: ILine = {
        from: [(letterToNumber as any)[match[1].toLowerCase()], (Number(match[2]) - 1) as TSquarePositionComponent],
        tipFrom: match[3] as TLineTip,
        body: match[4] as TLineBody,
        tipTo: match[5] as TLineTip,
        to: [(letterToNumber as any)[match[6].toLowerCase()], (Number(match[7]) - 1) as TSquarePositionComponent],
      };
      if (match[8]) line.color = match[8];
      if (match[9]) line.opacity = Number(match[9]);
      layout.lines!.push(line);
      continue;
    }

    // Squares like: `e4:red`
    match = part.match(
      /^\s*([a-hA-H])([0-8])\s*(:(\s*([prnbkqPRNBKQ](\s|\n|$))\s*(\s*([0-9.]+)\s*)?\s*)?\s*([\\/\-_]{0,4})?\s*(\s*([a-zA-Z#0-9]+)?(\s*\s*([0-9.]+)?)?)?\s*)?/, // eslint-disable-line
    );
    if (match) {
      const square: ISquare = {
        xy: [
          (Number(match[2]) - 1) as TSquarePositionComponent,
          (7 - (letterToNumber as any)[match[1].toLowerCase()]) as TSquarePositionComponent,
        ],
      };
      if (match[5]) square.piece = (pieceName2Letter as any)[match[5].trim()];
      if (match[8]) square.pieceOpacity = Number(match[8]);

      // Borders
      if (match[9]) {
        if (match[9].indexOf('-') > -1) square.borderTop = true;
        if (match[9].indexOf('\\') > -1) square.borderRight = true;
        if (match[9].indexOf('_') > -1) square.borderBottom = true;
        if (match[9].indexOf('/') > -1) square.borderLeft = true;
      }

      if (match[11]) square.color = match[11];
      if (match[13]) square.opacity = Number(match[13]);

      const existingSquare = layout.squares!.find((a) => a.xy[0] === square.xy[0] && a.xy[1] === square.xy[1]);
      if (existingSquare) {
        Object.assign(existingSquare, square);
      } else {
        layout.squares!.push(square);
      }
      continue;
    }

    // Borders like: `~a1 1 2 3 ddwwaasssd: red .7 red .2`
    match = part.match(
      /^\s*~\s*([a-hA-H])([0-8])(\s+([-0-9.]+))?(\s+([-0-9.]+))?(\s+([0-9.]+))?(\s+([asdw]+))\s*(:\s*([a-zA-Z#0-9]+)?(\s+([0-9.]+))?(\s+([0-9.]+))?)?(\s+([a-zA-Z#0-9]+))?(\s+([0-9.]+))?\s*/, // eslint-disable-line
    );
    if (match) {
      const border: IBorder = {
        xy: [(letterToNumber as any)[match[1].toLowerCase()], (Number(match[2]) - 1) as TSquarePositionComponent],
        segments: match[10],
      };
      if (match[4]) border.offset = [Number(match[4]), Number(match[6] || 0)];
      if (match[8]) border.segmentSize = Number(match[8]);
      if (match[12]) border.color = match[12];
      if (match[14]) border.opacity = Number(match[14]);
      if (match[16]) border.width = Number(match[16]);
      if (match[18]) border.fillColor = match[18];
      if (match[20]) border.fillOpacity = Number(match[20]);
      layout.borders!.push(border);
    }

    // Size like: `size: xl`
    // match = part.match(/^\s*size\s*:\s*(xxs|xs|s|m|l|xl|xxl)(\s|\n|$)\s*/i);
    // if(match) {
    //   layout.size = match[1];
    // }
  }

  if (!layout.borders!.length && !layout.lines!.length && !layout.squares!.length) return {};
  return layout;
};
