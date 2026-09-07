import * as React from 'react';
import {Num} from '../Num';

/** Top unit plus one sub-unit, zero sub-units trimmed: "1h 23m", "2h", "950 ms". */
const format = (ms: number): Array<{value: number; unit: string}> => {
  const abs = Math.abs(ms);
  if (!Number.isFinite(abs) || abs < 1000) return [{value: Math.round(abs) || 0, unit: 'ms'}];
  const s = Math.round(abs / 1000);
  if (s < 60) return [{value: s, unit: 's'}];
  const m = Math.floor(s / 60);
  if (m < 60)
    return s % 60
      ? [
          {value: m, unit: 'm'},
          {value: s % 60, unit: 's'},
        ]
      : [{value: m, unit: 'm'}];
  const h = Math.floor(m / 60);
  if (h < 24)
    return m % 60
      ? [
          {value: h, unit: 'h'},
          {value: m % 60, unit: 'm'},
        ]
      : [{value: h, unit: 'h'}];
  const d = Math.floor(h / 24);
  return h % 24
    ? [
        {value: d, unit: 'd'},
        {value: h % 24, unit: 'h'},
      ]
    : [{value: d, unit: 'd'}];
};

export interface DurationProps {
  /** Duration in milliseconds (magnitude; sign is ignored). */
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Human duration ("1h 23m"): unit selection here, {@link Num} renders each part. */
export const Duration: React.FC<DurationProps> = ({value, className, style}) => {
  const parts = React.useMemo(() => format(value), [value]);
  const title = `${Math.round(Math.abs(value)).toLocaleString()} ms`;
  return (
    <span className={className} style={{display: 'inline-flex', alignItems: 'baseline', gap: 6, ...style}}>
      {parts.map((part) => (
        <Num key={part.unit} value={part.value} unit={part.unit} title={title} />
      ))}
    </span>
  );
};
