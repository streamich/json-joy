import * as React from 'react';
import {rule} from 'nano-theme';
import type {ColorScales} from '../../../../../styles/color/types';
import type {Color} from '../../../../../styles/color/Color';
import {ColorRect} from './ColorRect';

const blockClass = rule({
  d: 'flex',
  columnGap: '4px',
  jc: 'center',
});

const stepNames = ['25', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

export interface ColorLineProps {
  color: Color;
  scales: ColorScales;
}

export const ColorLine: React.FC<ColorLineProps> = ({color, scales}) => {
  const {L, xS, dH} = scales;

  if (!L) return null;

  const nodes: React.ReactNode[] = [];
  const length = L.length;
  for (let i = 0; i < length; i++) {
    const lightness = L[i];
    let c = color.setL(lightness);
    const saturationFactor = xS ? (xS[i] ?? 1) : 1;
    const hueShift = dH ? (dH[i] ?? 0) : 0;
    if (saturationFactor !== 1) c = c.setS(c.S * saturationFactor);
    if (hueShift !== 0) c = c.setH(c.H + hueShift);
    nodes.push(
      <ColorRect key={i} color={c} title={stepNames[i]} subtitle={`${saturationFactor.toFixed(1)} : ${hueShift}`} />,
    );
  }

  return <div className={blockClass}>{nodes}</div>;
};
