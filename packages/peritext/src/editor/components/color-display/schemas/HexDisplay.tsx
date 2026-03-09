import * as React from 'react';
import {TextDisplay, Muted, type TextDisplayProps} from '../TexDisplay';
import type {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';

const toHex2 = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();

export interface HexDisplayProps extends Omit<TextDisplayProps, 'children'> {
  hsl: HslColor;
}

export const HexDisplay: React.FC<HexDisplayProps> = ({hsl, ...rest}) => {
  const [r, g, b, a] = hsl.toRgb().u8();
  const R = toHex2(r);
  const G = toHex2(g);
  const B = toHex2(b);
  const A = toHex2(a);

  return (
    <TextDisplay {...rest}>
      <Muted>#</Muted>
      {R}
      {G}
      {B}
      {a !== 255 && (
        <>
          <Muted inert>{'.'}</Muted>
          {A}
        </>
      )}
    </TextDisplay>
  );
};
