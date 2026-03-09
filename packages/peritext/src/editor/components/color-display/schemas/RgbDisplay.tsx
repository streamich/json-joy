import * as React from 'react';
import type {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {TextDisplay, Muted, type TextDisplayProps} from '../TexDisplay';

export interface RgbDisplayProps extends Omit<TextDisplayProps, 'children'> {
  hsl: HslColor;
}

export const RgbDisplay: React.FC<RgbDisplayProps> = ({hsl, ...rest}) => {
  const [r, g, b, a] = hsl.toRgb().u8();

  return (
    <TextDisplay {...rest}>
      <Muted>{a !== 255 ? 'rgba(' : 'rgb('}</Muted>
      {r}
      <Muted>{','}</Muted>
      {g}
      <Muted>{','}</Muted>
      {b}
      {a !== 255 && (
        <>
          <Muted>{','}</Muted>
          {String(+hsl.a.toFixed(2)).replace(/^0\./, '.')}
        </>
      )}
      <Muted>)</Muted>
    </TextDisplay>
  );
};
