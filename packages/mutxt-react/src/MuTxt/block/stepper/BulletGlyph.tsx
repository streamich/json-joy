import * as React from 'react';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {StepIndicator, StepState} from './types';

const CheckIcon = makeIcon({set: 'lucide', icon: 'check', width: 16, height: 16});
const AlertIcon = makeIcon({set: 'tabler_filled', icon: 'alert-triangle', width: 16, height: 16});
const OptionalIcon = makeIcon({set: 'tabler', icon: 'circle-dashed', width: 16, height: 16});

export interface BulletGlyphProps {
  state: StepState;
  indicator: StepIndicator;
  chars: string;
  index: number;
  color: string;
}

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const isEmoji = (s: string): boolean => EMOJI_RE.test(s);

const renderChars = (chars: string, color: string, index: number): React.ReactNode => {
  const trimmed = chars.slice(0, 2);
  if (!trimmed) return null;
  const emoji = isEmoji(trimmed);
  const single = Array.from(trimmed).length === 1;
  const fz = emoji ? (single ? 20 : 14) : single ? 18 : 14;
  void index;
  return (
    <span
      style={{
        fontSize: fz,
        lineHeight: 1,
        color,
        fontWeight: 600,
        letterSpacing: 0,
        ...(emoji ? {transform: 'translateY(1px)'} : null),
      }}
    >
      {trimmed}
    </span>
  );
};

const renderNumber = (index: number, color: string): React.ReactNode => {
  const text = String(index + 1);
  return <span style={{fontSize: 14, lineHeight: 1, color}}>{text}</span>;
};

export const BulletGlyph: React.FC<BulletGlyphProps> = ({
  state,
  indicator,
  chars,
  index,
  color,
}) => {
  if (indicator === 'chars') return <>{renderChars(chars, color, index)}</>;
  if (state === 'optional') return <OptionalIcon style={{color}} />;
  if (indicator === 'number') return <>{renderNumber(index, color)}</>;

  switch (state) {
    case 'done':
      return <CheckIcon style={{color}} />;
    case 'warning':
    case 'error':
      return <AlertIcon style={{color}} />;
    default:
      return <>{renderNumber(index, color)}</>;
  }
};
