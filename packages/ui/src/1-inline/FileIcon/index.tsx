import * as React from 'react';
import {HslColor} from '../../styles/color/HslColor';
import {useStyles} from '../../styles/context';
import {LinearRgbColor} from '../../styles/color';
import {type FileIconExtension, getColor} from './colors';

const LITE_TEXT = new LinearRgbColor(1, 1, 1, 0.7);
const DARK_TEXT = new LinearRgbColor(0, 0, 0, 0.7);

export interface FileIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Label shown inside the icon. May be one of the predefined {@link FileIconExtension}
   * values or a custom string (up to 4 characters are displayed).
   */
  label: string;

  /** Arbitrary id used for hashing, otherwise `label` is used. */
  id?: string;

  /** Optional extension hint for known file types, e.g. `json`, `js`, `ts`, `py` etc..
   * Used for color lookup and hashing. */
  ext?: FileIconExtension | string;

  /** Width (= height × 1.25 aspect). Default 16px. */
  size?: number;

  /**
   * Explicit primary CSS color (any CSS color syntax including `hsl(…)`).
   * Looks up registry color for known labels, such as `json`, `js` etc..,
   * otherwise falls back to hashing `label` or `id`.
   */
  color?: string;

  /**
   * Controls whether a gradient is drawn for the file body.
   *
   * - `true`: second stop is auto-computed via {@link HslColor.gradientPair}
   * - `false` or `undefined`: solid fill
   * - a CSS color string: used verbatim as the second gradient stop
   */
  gradient?: boolean | string;

  /**
   * Controls the accent used for the fold triangle.
   *
   * - `true`: auto-computed via {@link HslColor.accentColor} (triadic)
   * - `false` or `undefined`: complementary color is used ({@link HslColor.complement})
   * - a CSS color string: used verbatim
   */
  accent?: boolean | string;

  /**
   * If `true`, draws a small indicator badge at the bottom-right corner to
   * signify that this file is linked to an external source (e.g. local
   * filesystem, Dropbox, etc.) and changes will be mirrored back to that source.
   */
  link?: boolean;
}

export const FileIcon: React.FC<FileIconProps> = React.memo(
  ({label, id, ext, color = ext ? getColor(ext as any) : undefined, size = 16, gradient, accent, link, ...rest}) => {
    const id1 = React.useId();
    const id2 = React.useId();
    const styles = useStyles();
    const effectiveId = id || label;
    const primaryColor: HslColor = color
      ? (HslColor.from(color) ?? HslColor.fromHash(effectiveId))
      : HslColor.fromHash(effectiveId);
    const gradientColor: HslColor | null =
      gradient === true
        ? primaryColor.gradientPair()
        : typeof gradient === 'string'
          ? (HslColor.from(gradient) ?? primaryColor.gradientPair())
          : null;
    const accentColor: HslColor =
      accent === true
        ? primaryColor.accentColor()
        : typeof accent === 'string'
          ? (HslColor.from(accent) ?? primaryColor.complement())
          : primaryColor.copy(0.1, 0, -0.1);

    const h = size;
    const w = Math.round(size * 0.8);
    const viewW = 100;
    const viewH = 125;
    const f = 28; // fold size
    const r = 7; // corner radius
    const bodyPath = `M ${r},0 L ${viewW - f},0 L ${viewW},${f} L ${viewW},${viewH - r} Q ${viewW},${viewH} ${viewW - r},${viewH} L ${r},${viewH} Q 0,${viewH} 0,${viewH - r} L 0,${r} Q 0,0 ${r},0 Z`;
    const gradId = `fi-g-${id1}`;
    const clipId = `fi-c-${id2}`;
    const primaryStr = primaryColor.toString();
    const gradientStr = gradientColor?.toString() ?? primaryStr;
    const displayLabel = (label || '').slice(0, size < 21 ? 2 : size < 25 ? 3 : 4).toUpperCase();

    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${viewW} ${viewH}`}
        // xmlns="http://www.w3.org/2000/svg"
        {...rest}
        aria-label={label ? `${label} file` : 'file'}
        role="img"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryStr} />
            <stop offset="100%" stopColor={gradientStr} />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={bodyPath} />
          </clipPath>
        </defs>

        {/* main body */}
        <path d={bodyPath} fill={`url(#${gradId})`} />

        {/* subtle inner highlight (bottom strip) */}
        <rect
          x="0"
          y={viewH - Math.round(viewH * 0.18)}
          width={viewW}
          height={Math.round(viewH * 0.09)}
          fill="rgba(255,255,255,0.18)"
          clipPath={`url(#${clipId})`}
        />
        <rect
          x="0"
          y={viewH - Math.round(viewH * 0.09)}
          width={viewW}
          height={Math.round(viewH * 0.09)}
          fill="rgba(0,0,0,0.18)"
          clipPath={`url(#${clipId})`}
        />

        {/* fold triangle shadow */}
        <polygon
          points={`${viewW - f},0 ${viewW},${f} ${viewW - f},${f}`}
          fill={accentColor.toString()}
          opacity="0.72"
        />

        {/* fold crease line */}
        <line x1={viewW - f} y1={0} x2={viewW - f} y2={f} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

        {/* link badge — bottom-right chain glyph, clipped to file body so it
            cradles into the rounded corner */}
        {link && (
          <g clipPath={`url(#${clipId})`}>
            <circle cx={78} cy={103} r={34} fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
            <circle cx={78} cy={103} r={20} fill={accentColor.toString()} />
          </g>
        )}

        {/* label text */}
        {displayLabel && (
          <text
            x={viewW / 2}
            y={viewH * 0.56}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={primaryColor.toLinearRgb().pickFirstAboveOrMax(2, [LITE_TEXT, DARK_TEXT]) + ''}
            // fontSize={displayLabel.length * -2 + 40 + (size < 24 && displayLabel.length < 3 ? 4 : 0)}
            fontSize={displayLabel.length * -2 + 40 + (size < 25 ? 26 - displayLabel.length * 4 : 0)}
            fontFamily={
              styles.txt.get('mono', 'bold', 0).ff + ",'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace"
            }
            fontWeight="700"
            letterSpacing={displayLabel.length >= 4 ? '-1' : '0'}
          >
            {displayLabel}
          </text>
        )}
      </svg>
    );
  },
);
