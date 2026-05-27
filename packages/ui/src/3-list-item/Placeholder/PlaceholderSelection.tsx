import * as React from 'react';
import {rule} from 'nano-theme';

const selectionClass = rule({
  bdrad: '3px',
  pd: '2px 3px',
  'box-decoration-break': 'clone',
  '-webkit-box-decoration-break': 'clone',
});

const hexWithAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    const hex =
      color.length === 4
        ? color
            .slice(1)
            .split('')
            .map((c) => c + c)
            .join('')
        : color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${alpha * 100}%, transparent)`;
};

export interface PlaceholderSelectionProps {
  /** Selection color (typically a user color). */
  color: string;
  /** Background alpha 0..1. Defaults to 0.3. */
  opacity?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const PlaceholderSelection: React.FC<PlaceholderSelectionProps> = ({color, opacity = 0.3, style, children}) => (
  <span className={selectionClass} style={{background: hexWithAlpha(color, opacity), ...style}}>
    {children}
  </span>
);
