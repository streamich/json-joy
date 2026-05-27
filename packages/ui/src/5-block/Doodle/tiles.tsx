import * as React from 'react';
import {useStyles} from '../../styles/context';
import {BEND_PATH, BEND_ROTATION, BEND_UNIT, type BendOrientation} from './shapes';

const brandOf = (styles: ReturnType<typeof useStyles>, c: number): string => '' + styles.brand[c % 6].fg;

const useFill = (color: number | string | undefined, dim: boolean | undefined): string => {
  const styles = useStyles();
  if (dim) return styles.g(0.74);
  if (typeof color === 'string') return color;
  return brandOf(styles, color ?? 0);
};

export interface DoodleRectProps {
  size?: number;
  color?: number | string;
  dim?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DoodleRect: React.FC<DoodleRectProps> = ({size = 23, color, dim, style, className}) => {
  const fill = useFill(color, dim);
  return (
    <svg width={size} height={(size * 34) / 23} viewBox="0 0 23 34" fill="none" style={style} className={className}>
      <rect width="23" height="34" fill={fill} />
    </svg>
  );
};

export interface DoodleBendProps {
  size?: number;
  orientation?: BendOrientation;
  color?: number | string;
  dim?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DoodleBend: React.FC<DoodleBendProps> = ({
  size = 23,
  orientation = 'tr',
  color,
  dim,
  style,
  className,
}) => {
  const fill = useFill(color, dim);
  const deg = BEND_ROTATION[orientation];
  const c = BEND_UNIT / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${BEND_UNIT} ${BEND_UNIT}`}
      fill="none"
      style={style}
      className={className}
    >
      <path d={BEND_PATH} fill={fill} transform={deg ? `rotate(${deg} ${c} ${c})` : undefined} />
    </svg>
  );
};

export interface DoodleSquareProps {
  size?: number;
  color?: number | string;
  dim?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DoodleSquare: React.FC<DoodleSquareProps> = ({size = 23, color, dim, style, className}) => {
  const fill = useFill(color, dim);
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="none" style={style} className={className}>
      <rect width="23" height="23" fill={fill} />
    </svg>
  );
};
