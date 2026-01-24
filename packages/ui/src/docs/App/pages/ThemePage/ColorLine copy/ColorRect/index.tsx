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
  rowGap: '4px',
  bdrad: '12px',
  minW: '64px',
  w: '96px',
  h: '96px',
});

const lightClass = drule({
  fz: '15px',
});

const rgbClass = drule({
  fz: '12px',
});

export interface ColorRectProps {
  color: Color;
}

export const ColorRect: React.FC<ColorRectProps> = ({color}) => {
  const styles = useStyles();

  const rgb = hsl2rgb(color.H / 360, color.S / 100, color.L / 100);
  const rgbHex = rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
    .toUpperCase();
  const fg = color.L < 50 ? color.setL(90) : color.setL(10);

  return (
    <div className={blockClass} style={{background: color + '', color: fg + ''}}>
      <div className={lightClass({...styles.txt.get('sans', 'bold')})}>{Math.round(10 * (100 - color.L))}</div>
      <div className={rgbClass({...styles.txt.get('sans')})}>{rgbHex}</div>
    </div>
  );
};
