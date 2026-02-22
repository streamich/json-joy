import {CDN} from '../../../../misc/conf';

export const PIECES = {
  r: CDN + '/chess/br.png',
  b: CDN + '/chess/bb.png',
  k: CDN + '/chess/bk.png',
  n: CDN + '/chess/bn.png',
  p: CDN + '/chess/bp.png',
  q: CDN + '/chess/bq.png',
  R: CDN + '/chess/wr.png',
  B: CDN + '/chess/wb.png',
  K: CDN + '/chess/wk.png',
  N: CDN + '/chess/wn.png',
  P: CDN + '/chess/wp.png',
  Q: CDN + '/chess/wq.png',
};

export const squareWidth = 100 * (1 / 8);
export const pieceMargin = 0.0; // How far piece image is from square boundaries, in %.
export const borderWidth = 0.07;
export const borderColor = '#000';
export const borderOpacity = 0.65;
