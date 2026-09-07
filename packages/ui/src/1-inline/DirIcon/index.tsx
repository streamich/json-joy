import * as React from 'react';
import {HslColor} from '../../styles/color/HslColor';
import {useStyles} from '../../styles/context';

/** Default "manila" folder yellow. */
export const DIR_YELLOW = '#fcc24d';

type Pt = readonly [x: number, y: number, r: number];

/**
 * Build a path string for a closed polygon whose corners are rounded with
 * per-vertex radii (each vertex carries its own radius as the 3rd tuple item).
 * Quadratic curves are used for the corners — cheap and visually smooth.
 */
const roundedPath = (pts: readonly Pt[]): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[(i - 1 + n) % n];
    const [x, y, r] = pts[i];
    const [nx, ny] = pts[(i + 1) % n];
    const v1x = px - x;
    const v1y = py - y;
    const v2x = nx - x;
    const v2y = ny - y;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const r1 = Math.min(r, l1 / 2);
    const r2 = Math.min(r, l2 / 2);
    const ax = x + (v1x / l1) * r1;
    const ay = y + (v1y / l1) * r1;
    const bx = x + (v2x / l2) * r2;
    const by = y + (v2y / l2) * r2;
    d += `${i === 0 ? 'M' : 'L'} ${+ax.toFixed(2)} ${+ay.toFixed(2)} Q ${+x.toFixed(2)} ${+y.toFixed(2)} ${+bx.toFixed(2)} ${+by.toFixed(2)} `;
  }
  return d + 'Z';
};

const VW = 120;
const VH = 100;
const L = 6;
const R = 114;
const B = 94;
const TAB_TOP = 12; // top of the raised tab
const BODY_TOP = 30; // top edge of the body, right of the tab
const TAB_RIGHT = 52; // where the tab top ends and the chamfer begins
const CHAMFER = 70; // where the chamfer meets the body top
const RC = 13; // body corner radius
const RT = 9; // tab corner radius
const RCH = 5; // chamfer corner radius
const FRONT_TOP = 42; // top of the front pocket when closed
const FRONT_TOP_OPEN = 49; // top of the front pocket when open
const FLARE = 8; // how much the open pocket flares past the sides
const INSET = 14; // how much the open pocket narrows at the bottom

const BACK_PTS: readonly Pt[] = [
  [L, TAB_TOP, RT],
  [TAB_RIGHT, TAB_TOP, RT],
  [CHAMFER, BODY_TOP, RCH],
  [R, BODY_TOP, RC],
  [R, B, RC],
  [L, B, RC],
];

const FRONT_CLOSED_PTS: readonly Pt[] = [
  [L, FRONT_TOP, 8],
  [R, FRONT_TOP, 8],
  [R, B, RC],
  [L, B, RC],
];

const FRONT_OPEN_PTS: readonly Pt[] = [
  [L - FLARE, FRONT_TOP_OPEN, 9],
  [R + FLARE, FRONT_TOP_OPEN, 9],
  [R - INSET, B, RC],
  [L + INSET, B, RC],
];

const BACK_PATH = roundedPath(BACK_PTS);
const FRONT_CLOSED_PATH = roundedPath(FRONT_CLOSED_PTS);
const FRONT_OPEN_PATH = roundedPath(FRONT_OPEN_PTS);

// Sheet stacks: [x, top] pairs, drawn back-to-front. Bottoms run off-screen and
// are hidden behind the front pocket. Width is constant.
const SHEET_W = 58;
const SHEET_BOTTOM = 88;
const SHEETS_CLOSED: ReadonlyArray<readonly [number, number]> = [
  [27, 31],
  [35, 27],
  [31, 33],
];
const SHEETS_OPEN: ReadonlyArray<readonly [number, number]> = [
  [25, 15],
  [37, 9],
  [31, 18],
];

const BADGE_FS = 11; // px font size
const BADGE_H = 17; // px pill height
const BADGE_PADX = 5; // px horizontal padding inside the pill
const BADGE_MAX_FRAC = 0.72; // pill never taller than this fraction of the icon

export interface DirIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'color'> {
  /** Height in px (folder width is ~1.2x this). Default 16px. */
  size?: number;

  /**
   * Primary (front) folder color, any CSS color syntax including `hsl(...)`.
   * Defaults to a warm manila yellow. Use this to color-code folders.
   */
  color?: string;

  /**
   * Accent for the tab/back panel (the part peeking behind the front pocket).
   *
   * - `false` / `undefined`: auto — a deeper, slightly more saturated shade of
   *   the primary color.
   * - `true`: a stronger auto accent (more saturation, more depth).
   * - a CSS color string: used verbatim.
   */
  accent?: boolean | string;

  /**
   * Controls the front-pocket gradient.
   *
   * - `false` / `undefined`: solid fill.
   * - `true`: auto — same hue, darker toward the bottom.
   * - a CSS color string: used verbatim as the bottom gradient stop.
   */
  gradient?: boolean | string;

  /** Render the folder in its open state (lid flared forward). */
  open?: boolean;

  /**
   * Whether the folder contains files — draws sheets of paper peeking out.
   *
   * - `false` / `undefined`: empty folder, no sheets.
   * - `true`: a small stack (2 sheets in rich mode, 1 in flat mode).
   * - a number `1…3`: that many sheets.
   */
  files?: boolean | number;

  /**
   * Visual fidelity.
   *
   * - `'auto'` (default): rich for `size ≥ 36`, flat below.
   * - `'rich'`: gradients, soft shadows/highlights, multi-sheet stacks — best
   *   for thumbnails (64px+) and avatars.
   * - `'flat'`: solid two-tone, single sheet, no soft effects — crisp at 16–32px.
   */
  variant?: 'auto' | 'rich' | 'flat';

  /**
   * If `true`, draws a small badge at the bottom-right to signify the folder is
   * linked to an external source (local FS, Dropbox, cloud, …).
   */
  link?: boolean;

  /** Optional item-count badge drawn at the top-right corner. */
  count?: number;
}

export const DirIcon: React.FC<DirIconProps> = React.memo(
  ({size = 16, color, accent, gradient, open, files, variant = 'auto', link, count, style, ...rest}) => {
    const uid = React.useId();
    const styles = useStyles();
    const rich = variant === 'rich' || (variant === 'auto' && size >= 36);

    const primary = HslColor.from(color ?? DIR_YELLOW) ?? (HslColor.from(DIR_YELLOW) as HslColor);

    // The back panel / tab is the visible "accent". By default it is a deeper,
    // slightly warmer shade of the primary; `accent` makes it a distinctly
    // stronger, more saturated tab (or any explicit color).
    const defaultBack = primary.copy(-0.012, 0.06, -0.16);
    const backColor =
      accent === true
        ? primary.copy(-0.05, 0.26, -0.24)
        : typeof accent === 'string'
          ? (HslColor.from(accent) ?? defaultBack)
          : defaultBack;

    const gradientBottom: HslColor | null =
      gradient === true
        ? primary.copy(0, 0.0, -0.12)
        : typeof gradient === 'string'
          ? (HslColor.from(gradient) ?? primary.copy(0, 0.0, -0.12))
          : null;

    const insideColor = backColor.copy(0, 0.04, -0.14); // shadowy folder interior when open

    const w = Math.round(size * (VW / VH));
    const h = size;

    const gradId = `di-g-${uid}`;
    const frontClipId = `di-fc-${uid}`;
    const backClipId = `di-bc-${uid}`;

    const primaryStr = primary.toString();
    const backStr = backColor.toString();
    const frontFill = gradientBottom ? `url(#${gradId})` : primaryStr;
    const frontPath = open ? FRONT_OPEN_PATH : FRONT_CLOSED_PATH;
    const frontTop = open ? FRONT_TOP_OPEN : FRONT_TOP;

    const nSheets = files
      ? typeof files === 'number'
        ? Math.max(0, Math.min(3, Math.round(files)))
        : rich
          ? 2
          : 1
      : 0;
    const sheetCoords = open ? SHEETS_OPEN : SHEETS_CLOSED;
    const sheets = sheetCoords.slice(0, rich ? nSheets : Math.min(nSheets, 1));
    const ariaLabel = `${open ? 'open ' : ''}folder${nSheets ? '' : ' (empty)'}`;
    const hasCount = count != null;
    const countLabel = hasCount ? (count > 99 ? '99+' : String(count)) : '';
    const badgeW = Math.max(BADGE_H, countLabel.length * BADGE_FS * 0.62 + BADGE_PADX * 2);
    const badgeScale = (VH / size) * Math.min(1, (size * BADGE_MAX_FRAC) / BADGE_H);
    const badgeOverhang = Math.min(1, Math.max(0, (48 - size) / 40)) * 0.5;
    const badgeX = R + badgeW * badgeScale * badgeOverhang;
    const badgeY = 1 - BADGE_H * badgeScale * badgeOverhang;
    const overflowVisible = link || hasCount;
    const linkColor = backColor.copy(0, 0.12, -0.04);

    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${VW} ${VH}`}
        {...rest}
        style={overflowVisible ? {overflow: 'visible', ...style} : style}
        aria-label={ariaLabel}
        role="img"
      >
        <defs>
          {gradientBottom && (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primaryStr} />
              <stop offset="100%" stopColor={gradientBottom.toString()} />
            </linearGradient>
          )}
          <clipPath id={frontClipId}>
            <path d={frontPath} />
          </clipPath>
          <clipPath id={backClipId}>
            <path d={BACK_PATH} />
          </clipPath>
        </defs>

        {/* back panel + tab */}
        <path d={BACK_PATH} fill={backStr} />

        {/* darkened interior visible through the mouth when open */}
        {open && (
          <rect
            x={L}
            y={FRONT_TOP_OPEN - 11}
            width={R - L}
            height={14}
            fill={insideColor.toString()}
            clipPath={`url(#${backClipId})`}
          />
        )}

        {/* sheets of paper — white, lightly shaded back-to-front for stack depth */}
        {sheets.map(([x, top], i) => (
          <rect
            key={i}
            x={x}
            y={top}
            width={SHEET_W}
            height={SHEET_BOTTOM - top}
            rx={3}
            fill={i === sheets.length - 1 ? '#ffffff' : i === 0 ? '#e6e8eb' : '#f2f3f5'}
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* faint shadow where the front pocket overlaps the back (rich only) */}
        {rich && (
          <rect
            x={L}
            y={frontTop - 2}
            width={R - L}
            height={3}
            fill="rgba(0,0,0,0.12)"
            clipPath={`url(#${backClipId})`}
          />
        )}

        {/* front pocket */}
        <path d={frontPath} fill={frontFill} />

        {/* inner top highlight + bottom shade for depth (rich only) */}
        {rich && (
          <g clipPath={`url(#${frontClipId})`}>
            <rect x={L - FLARE} y={frontTop} width={VW} height={3} fill="rgba(255,255,255,0.28)" />
            <rect x={0} y={B - 9} width={VW} height={9} fill="rgba(0,0,0,0.12)" />
          </g>
        )}

        {/* link emblem — sits on the bottom-right corner, unmasked so it reads
            as a standalone status indicator overhanging the folder */}
        {link && (
          <g>
            <circle cx={R - 10} cy={B - 4} r={17} fill="#ffffff" stroke="rgba(0,0,0,0.16)" strokeWidth={2} />
            <circle cx={R - 10} cy={B - 4} r={9.5} fill={linkColor.toString()} />
          </g>
        )}

        {/* item-count badge — top-right corner, drawn in px units then
            counter-scaled so it stays a near-constant on-screen size */}
        {hasCount && (
          <g transform={`translate(${+badgeX.toFixed(2)} ${+badgeY.toFixed(2)}) scale(${+badgeScale.toFixed(4)})`}>
            <rect
              x={-badgeW}
              y={0}
              width={badgeW}
              height={BADGE_H}
              rx={BADGE_H / 2}
              fill="#ffffff"
              stroke="rgba(0,0,0,0.14)"
              strokeWidth={1.25}
            />
            <text
              x={-badgeW / 2}
              y={BADGE_H / 2 + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fill="rgba(0,0,0,0.74)"
              fontSize={BADGE_FS}
              fontFamily={[styles?.txt?.get('mono', 'bold', 0)?.ff, 'ui-monospace', 'monospace']
                .filter(Boolean)
                .join(', ')}
              fontWeight="700"
            >
              {countLabel}
            </text>
          </g>
        )}
      </svg>
    );
  },
);
