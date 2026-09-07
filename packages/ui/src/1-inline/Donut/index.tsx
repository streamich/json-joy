import * as React from 'react';
import {useStyles} from '../../styles/context';

const clamp = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

export interface DonutProps {
  /** Filled fraction of the ring, `0` ... `1`. @default 0 */
  progress?: number;
  /** Hole size as a fraction of the radius: `0` is a filled disk (pie),
   * `1` collapses the ring to nothing (invisible). @default 0.6 */
  cutout?: number;
  /** Diameter in pixels. @default 16 */
  size?: number;
  /** Progress arc color — any CSS color. @default 'currentColor' */
  color?: string;
  /** Unfilled track color, or `'none'` to hide it. @default a subtle neutral */
  trackColor?: string;
  /** Round the ends of the progress arc. @default false */
  rounded?: boolean;
  /** Accessible label; when omitted the donut is `aria-hidden` (decorative). */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A colorable donut/pie progress indicator. The ring fills clockwise from the
 * top by {@link DonutProps.progress}; {@link DonutProps.cutout} morphs it from a
 * solid disk (`0`) through a ring to invisible (`1`).
 */
export const Donut: React.FC<DonutProps> = ({
  progress = 0,
  cutout = 0.6,
  size = 16,
  color = 'currentColor',
  trackColor,
  rounded,
  'aria-label': ariaLabel,
  className,
  style,
}) => {
  const styles = useStyles();
  const p = clamp(progress);
  const r = size / 2; // outer radius
  const inner = clamp(cutout) * r; // hole radius
  const thickness = r - inner; // ring width
  const mid = (r + inner) / 2; // stroke centerline
  const circumference = 2 * Math.PI * mid;
  const track = trackColor ?? styles.g(0.5, 0.22);
  const showTrack = thickness > 0 && track !== 'none';
  const showProgress = thickness > 0 && p > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {showTrack && <circle cx={r} cy={r} r={mid} fill="none" stroke={track} strokeWidth={thickness} />}
      {showProgress && (
        <circle
          cx={r}
          cy={r}
          r={mid}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={rounded ? 'round' : 'butt'}
          strokeDasharray={`${p * circumference} ${circumference}`}
          // Start the arc at 12 o'clock instead of 3 o'clock.
          transform={`rotate(-90 ${r} ${r})`}
        />
      )}
    </svg>
  );
};
