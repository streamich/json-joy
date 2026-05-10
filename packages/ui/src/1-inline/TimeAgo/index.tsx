import * as React from 'react';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = drule({
  ...lightTheme.font.ui1.mid,
  d: 'inline-block',
  fz: '13px',
  lh: '18px',
  whiteSpace: 'nowrap',
  cur: 'default',
});

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const toDate = (value: number | Date | string): Date => (value instanceof Date ? value : new Date(value));

const pickInterval = (absMs: number): number => {
  if (absMs < MINUTE) return SECOND;
  if (absMs < HOUR) return MINUTE;
  if (absMs < DAY) return HOUR;
  return DAY;
};

const formatAgo = (deltaMs: number, short: boolean): string => {
  const past = deltaMs >= 0;
  const abs = Math.abs(deltaMs);

  let value: number;
  let unit: string;

  if (abs < 5 * SECOND) return 'just now';
  if (abs < MINUTE) {
    value = Math.round(abs / SECOND);
    unit = short ? 's' : `second${value === 1 ? '' : 's'}`;
  } else if (abs < HOUR) {
    value = Math.round(abs / MINUTE);
    unit = short ? 'm' : `minute${value === 1 ? '' : 's'}`;
  } else if (abs < DAY) {
    value = Math.round(abs / HOUR);
    unit = short ? 'h' : `hour${value === 1 ? '' : 's'}`;
  } else if (abs < WEEK) {
    value = Math.round(abs / DAY);
    unit = short ? 'd' : `day${value === 1 ? '' : 's'}`;
  } else if (abs < MONTH) {
    value = Math.round(abs / WEEK);
    unit = short ? 'w' : `week${value === 1 ? '' : 's'}`;
  } else if (abs < YEAR) {
    value = Math.round(abs / MONTH);
    unit = short ? 'mo' : `month${value === 1 ? '' : 's'}`;
  } else {
    value = Math.round(abs / YEAR);
    unit = short ? 'y' : `year${value === 1 ? '' : 's'}`;
  }

  if (short) return past ? `${value}${unit} ago` : `in ${value}${unit}`;
  return past ? `${value} ${unit} ago` : `in ${value} ${unit}`;
};

export interface TimeAgoProps {
  /** Timestamp (ms), Date, or ISO string. */
  value: number | Date | string;
  /** Use short units (`5m ago` vs `5 minutes ago`). */
  short?: boolean;
  /** Auto-refresh as time passes. Default: true. */
  live?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TimeAgo: React.FC<TimeAgoProps> = ({value, short, live = true, className, style}) => {
  const styles = useStyles();
  const date = React.useMemo(() => toDate(value), [value]);
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!live) return;
    const tick = () => setNow(Date.now());
    const delta = Math.abs(now - date.getTime());
    const interval = pickInterval(delta);
    const id = window.setInterval(tick, interval);
    return () => window.clearInterval(id);
  }, [live, date, now]);

  const label = formatAgo(now - date.getTime(), !!short);

  return (
    <span
      className={blockClass({col: styles.g(0.35)}) + (className ? ` ${className}` : '')}
      style={style}
      title={date.toISOString()}
      data-iso={date.toISOString()}
    >
      {label}
    </span>
  );
};
