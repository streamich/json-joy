import * as React from 'react';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {TextDisplay, Muted, TextDisplayProps} from '../TexDisplay';

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
      <Muted inert>{'deg'}</Muted>
      <Muted>{' '}</Muted>
      {S}
      <Muted inert>{'%'}</Muted>
      <Muted>{' '}</Muted>
      {L}
      <Muted inert>{'%'}</Muted>
      {a !== 1 && (
        <>
          <Muted>{' / '}</Muted>
          {+(a * 100).toFixed(1)}
          <Muted inert>{'%'}</Muted>
        </>
      )}
      <Muted>)</Muted>
    </TextDisplay>
  );
};
