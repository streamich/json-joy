import * as React from 'react';
import type {StepIndicator, StepState} from './types';
import CheckIcon__svg from 'iconista/lib/react/lucide/check';
import AlertIcon__svg from 'iconista/lib/react/tabler_filled/alert-triangle';
import OptionalIcon__svg from 'iconista/lib/react/tabler/circle-dashed';

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CheckIcon__svg width={16} height={16} {...props} />;
const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <AlertIcon__svg width={16} height={16} {...props} />;
const OptionalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <OptionalIcon__svg width={16} height={16} {...props} />;

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
