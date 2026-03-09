import * as React from 'react';
import type {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {TextDisplay, Muted, type TextDisplayProps} from '../TexDisplay';

export interface HslDisplayProps extends Omit<TextDisplayProps, 'children'> {
  hsl: HslColor;
}

export const HslDisplay: React.FC<HslDisplayProps> = ({hsl, ...rest}) => {
  const {h, s, l, a} = hsl;
  const H = +(h * 360).toFixed(0);
  const S = +(s * 100).toFixed(1);
  const L = +(l * 100).toFixed(1);

  return (
    <TextDisplay {...rest}>
      <Muted>hsl(</Muted>
      {H}
      {a !== 1 ? null : <Muted inert>{'deg'}</Muted>}
      <Muted> </Muted>
      {S}
      {a !== 1 ? null : <Muted inert>{'%'}</Muted>}
      <Muted> </Muted>
      {L}
      {a !== 1 ? null : <Muted inert>{'%'}</Muted>}
      {a !== 1 && (
        <>
          <Muted>{' / '}</Muted>
          {+(a * 100).toFixed(1)}
        </>
      )}
      <Muted>)</Muted>
    </TextDisplay>
  );
};
