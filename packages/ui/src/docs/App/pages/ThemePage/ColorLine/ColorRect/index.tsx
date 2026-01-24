import * as React from 'react';
import {drule, rule} from 'nano-theme';
import type {Color} from '../../../../../../styles/color/Color';
import {hsl2rgb} from '../../../../../../utils/colors';
import {useStyles} from '../../../../../../styles/context';

const blockClass = rule({
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'center',
  rowGap: '2px',
  bdrad: '12px',
  minW: '64px',
  w: '96px',
  h: '112px',
});

const lightClass = drule({
  pd: '32px 0 3px',
  fz: '19.6px',
});

const rgbClass = drule({
  fz: '11px',
  op: 0.7,
});

export interface ColorRectProps {
  title?: string;
  subtitle?: string;
  color: Color;
}

export const ColorRect: React.FC<ColorRectProps> = ({title, subtitle, color}) => {
  const styles = useStyles();

  const rgb = hsl2rgb(color.H / 360, color.S / 100, color.L / 100);
  const _rgbHex = rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase();
  const fg = color.L < 70 ? color.setL(95).setS(color.S * 0.2) : color.setL(20).setS(color.S * 0.5);

  return (
    <div className={blockClass} style={{background: color + '', color: fg + ''}}>
      {/* <div className={lightClass({...styles.txt.get('sans', 'bold')})}>{Math.round(10 * (100 - color.L))}</div> */}
      {/* <div className={lightClass({...styles.txt.get('sans', 'bold')})}>{Math.round(color.L)}</div> */}
      {!!title && <div className={lightClass({...styles.txt.get('sans', 'bold')})}>{title}</div>}
      {!!subtitle && <div className={rgbClass({...styles.txt.get('mono', 'mid', 1)})}>{subtitle}</div>}
    </div>
  );
};
