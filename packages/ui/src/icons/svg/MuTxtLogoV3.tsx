import * as React from 'react';
import {useStyles} from '../../styles/context';
import {BEND_PATH, BEND_UNIT, BEND_ROTATION, type BendOrientation} from '../../5-block/Doodle/shapes';

const U = BEND_UNIT;
const C = U / 2;
const RECT_H = 34;
const OVER = RECT_H - U;
const COLS = 5;
const VB_W = COLS * U;
const VB_H = 2 * U + 2 * OVER;
const TOP = OVER;
const BOTTOM = OVER + U;

type Tile = {k: 'b'; o: BendOrientation; c: number} | {k: 'r'; c: number};

const COLUMNS: {top: Tile; bottom: Tile}[] = [
  {top: {k: 'b', o: 'br', c: 1}, bottom: {k: 'r', c: 2}},
  {top: {k: 'b', o: 'bl', c: 0}, bottom: {k: 'b', o: 'tr', c: 3}},
  {top: {k: 'b', o: 'br', c: 1}, bottom: {k: 'b', o: 'tl', c: 4}},
  {top: {k: 'b', o: 'bl', c: 0}, bottom: {k: 'b', o: 'tr', c: 3}},
  {top: {k: 'r', c: 5}, bottom: {k: 'b', o: 'tl', c: 4}},
];

export interface Props {
  size?: number;
  /** Force a single color. */
  color?: string;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MuTxtLogoV3: React.FC<Props> = ({size = 180, color, title, className, style}) => {
  const styles = useStyles();
  const col = (c: number) => color ?? '' + styles.brand[c].fg;
  const bleed = Math.min(1, VB_W / size);

  const tile = (t: Tile, x: number, top: boolean, key: string) => {
    if (t.k === 'r')
      return <rect key={key} x={x} y={top ? 0 : BOTTOM - bleed} width={U} height={RECT_H + bleed} fill={col(t.c)} />;
    const y = top ? TOP : BOTTOM;
    const deg = BEND_ROTATION[t.o];
    return (
      <path
        key={key}
        d={BEND_PATH}
        fill={col(t.c)}
        transform={`translate(${x} ${y})${deg ? ` rotate(${deg} ${C} ${C})` : ''}`}
      />
    );
  };

  return (
    <svg
      width={size}
      height={(size * VB_H) / VB_W}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      fill="none"
      // xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title ?? 'mutxt'}
      className={className}
      style={style}
    >
      {title ? <title>{title}</title> : null}
      {COLUMNS.map((c, i) => (
        <React.Fragment key={i}>
          {tile(c.top, i * U, true, `t${i}`)}
          {tile(c.bottom, i * U, false, `b${i}`)}
        </React.Fragment>
      ))}
    </svg>
  );
};

export default MuTxtLogoV3;
