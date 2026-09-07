import {rule} from 'nano-theme';
import * as React from 'react';
import {fonts} from '../../styles';
import {RgbColor} from '../../styles/color/RgbColor';
import {ColorPreview} from '../ColorPreview';

const rootClass = rule({
  ...fonts.get('mono', 'bold', 0),
  d: 'inline-flex',
  ai: 'center',
  gap: '6px',
  maxW: '100%',
  minWidth: 0,
  whiteSpace: 'nowrap',
  // Center the whole chip on its line instead of sitting on the text baseline:
  // an inline-flex defaults to baseline alignment, and with the tall swatch that
  // leaves the line's font-strut descent as extra space below, floating it up.
  lineHeight: '1',
  verticalAlign: 'middle',
  // Reserve room for the swatch's drop shadow so tight `overflow: hidden` parents
  // (e.g. the value-cell chip, which truncates long values) don't crop it. A
  // clipping ancestor cuts at the chip edge, so the room has to be real padding
  // inside the box, not negative margin (which would re-enter the clip). Vertical
  // is symmetric to keep the content centered; horizontal is the minimal 2px.
  bxz: 'border-box',
  pad: '3px 2px',
});

const textClass = rule({
  ov: 'hidden',
  textOverflow: 'ellipsis',
  // Tight line box so the text's cross-size matches the swatch and the two
  // center cleanly (no `normal` line-height leading skewing the alignment).
  lineHeight: '1',
  // Optical correction: the hex is caps/digits only (no descenders), so the ink
  // sits in the upper part of its line box and reads ~0.09em high next to the
  // swatch when box-centered. Nudge down to center the glyphs, not the box.
  transform: 'translateY(0.09em)',
});

const mutedStyle: React.CSSProperties = {opacity: 0.6};
const mutedInertStyle: React.CSSProperties = {opacity: 0.6, userSelect: 'none'};

const toHex2 = (n: number): string => n.toString(16).padStart(2, '0').toUpperCase();

export interface ColorValueProps {
  /** CSS color string (hex, `rgb(...)`, etc.). */
  color: string;
  /** Preview swatch size in px. @default 14 */
  size?: number;
}

/**
 * Inline technical rendering of a color value: a small preview swatch followed
 * by the hex code in monospace — a muted `#`, uppercase digits, and a muted
 * `.AA` alpha byte when not fully opaque. Mirrors the peritext color-display
 * `HexDisplay` style. Unparseable colors fall back to the raw string.
 */
export const ColorValue: React.FC<ColorValueProps> = ({color, size = 14}) => {
  const rgb = RgbColor.fromString(color.trim());
  const [r, g, b, a] = rgb ? rgb.u8() : [0, 0, 0, 255];

  return (
    <span className={rootClass}>
      <ColorPreview color={color} size={size} checkerboard={!!rgb && a !== 255} />
      <span className={textClass}>
        {rgb ? (
          <>
            <span style={mutedStyle}>#</span>
            {toHex2(r)}
            {toHex2(g)}
            {toHex2(b)}
            {a !== 255 && (
              <>
                <span style={mutedInertStyle}>.</span>
                {toHex2(a)}
              </>
            )}
          </>
        ) : (
          color
        )}
      </span>
    </span>
  );
};
