import * as React from 'react';
import {rule} from 'nano-theme';
import type {ColorScale} from '../../../../../styles/color/types';
import type {Color} from '../../../../../styles/color/Color';
import {ColorRect} from './ColorRect';

const blockClass = rule({
  d: 'flex',
  columnGap: '6px',
  jc: 'center',
});

export interface ColorLineProps {
  color: Color;
  scale: ColorScale;
}

export const ColorLine: React.FC<ColorLineProps> = ({color, scale}) => {
  return (
    <div className={blockClass}>
      {scale.map((L) => (
        <ColorRect key={L} color={color.setL(L)} />
      ))}
    </div>
  );
};
