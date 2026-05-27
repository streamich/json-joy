import * as React from 'react';
import {useStyles} from '../../styles/context';
import {BEND_TL, BEND_TR, BEND_BL, BEND_BR} from '../../5-block/Doodle/shapes';

const U = 23;
const M_W = 2 * U;
const U_W = 2 * U;
const H = 2 * U;
const W = M_W + U_W;

export interface Props extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  size?: number;
  color?: string;
  title?: string;
}

export const MuTxtLogoV2: React.FC<Props> = ({size = 36, color, title, ...props}) => {
  const styles = useStyles();
  const col = (c: number) => color ?? '' + styles.brand[c].fg;

  return (
    <svg
      width={size}
      height={(size * H) / W}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title ?? 'mutxt'}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* m : dome on top of two squares */}
      <g>
        <path d={BEND_TL} fill={col(1)} />
        <path d={BEND_TR} transform={`translate(${U} 0)`} fill={col(5)} />
        <rect x={0} y={U} width={U} height={U} fill={col(2)} />
        <rect x={U} y={U} width={U} height={U} fill={col(4)} />
      </g>

      {/* u : two top bends carve an open gap, inverted dome closes the bottom */}
      <g transform={`translate(${M_W} 0)`}>
        <path d={BEND_TR} fill={col(3)} />
        <path d={BEND_TL} transform={`translate(${U} 0)`} fill={col(5)} />
        <path d={BEND_BL} transform={`translate(0 ${U})`} fill={col(0)} />
        <path d={BEND_BR} transform={`translate(${U} ${U})`} fill={col(4)} />
      </g>
    </svg>
  );
};

export default MuTxtLogoV2;
