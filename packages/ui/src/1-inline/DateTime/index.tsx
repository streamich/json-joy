import * as React from 'react';
import {theme, rule, useRule} from 'nano-theme';

const blockClass = rule({
  ...theme.font.ui1.mid,
  d: 'inline-flex',
  ai: 'baseline',
  gap: '6px',
  ws: 'nowrap',
});

const dateClass = rule({
  fz: '13px',
  lh: '18px',
});

const timeClass = rule({
  ...theme.font.mono.mid,
  fz: '12px',
  lh: '18px',
  letterSpacing: '0.01em',
});

const sepClass = rule({
  d: 'inline-block',
  w: '3px',
  h: '3px',
  bdrad: '50%',
  alignSelf: 'center',
});

export interface DateTimeProps {
  /** Timestamp (ms), Date object, or ISO string. */
  value: number | Date | string;
  /** Hide the date part. */
  timeOnly?: boolean;
  /** Hide the time part. */
  dateOnly?: boolean;
  /** Include seconds in the time. */
  seconds?: boolean;
  /** Use short month name (Jan) instead of long (January). Default: short. */
  long?: boolean;
  /** Override the user's locale. */
  locale?: string | string[];
  className?: string;
  style?: React.CSSProperties;
}

const toDate = (value: number | Date | string): Date => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const DateTime: React.FC<DateTimeProps> = ({
  value,
  timeOnly,
  dateOnly,
  seconds,
  long,
  locale,
  className,
  style,
}) => {
  const date = toDate(value);

  const dateLabel = React.useMemo(() => {
    if (timeOnly) return '';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric',
    }).format(date);
  }, [date.getTime(), timeOnly, long, locale]);

  const timeLabel = React.useMemo(() => {
    if (dateOnly) return '';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
      hour12: false,
    }).format(date);
  }, [date.getTime(), dateOnly, seconds, locale]);

  const dynamicDateClass = useRule((t) => ({col: t.g(0.2)}));
  const dynamicTimeClass = useRule((t) => ({col: t.g(0.5)}));
  const dynamicSepClass = useRule((t) => ({bg: t.g(0, 0.25)}));

  const iso = date.toISOString();

  return (
    <span
      className={blockClass + (className ? ` ${className}` : '')}
      style={style}
      title={iso}
      data-iso={iso}
    >
      {!timeOnly && <span className={dateClass + dynamicDateClass}>{dateLabel}</span>}
      {!timeOnly && !dateOnly && <span className={sepClass + dynamicSepClass} aria-hidden="true" />}
      {!dateOnly && <span className={timeClass + dynamicTimeClass}>{timeLabel}</span>}
    </span>
  );
};
