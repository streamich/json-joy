import {drule, lightTheme, rule} from 'nano-theme';
import * as React from 'react';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  ...lightTheme.font.ui1.mid,
  d: 'inline-flex',
  ai: 'baseline',
  gap: '6px',
  ws: 'nowrap',
});

const dateClass = drule({
  fz: '13px',
  lh: '18px',
});

const timeClass = drule({
  ...lightTheme.font.mono.mid,
  fz: '12px',
  lh: '18px',
  letterSpacing: '0.01em',
});

const sepClass = drule({
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
  /** Track the surrounding font size (slightly reduced) instead of the fixed 13/12px. */
  inherit?: boolean;
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
  inherit,
  className,
  style,
}) => {
  const styles = useStyles();
  const date = toDate(value);

  const time = date.getTime();

  // biome-ignore lint/correctness/useExhaustiveDependencies: depend on the timestamp, not the Date instance, to avoid recomputing for equivalent dates
  const dateLabel = React.useMemo(() => {
    if (timeOnly) return '';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: long ? 'long' : 'short',
      year: 'numeric',
    }).format(date);
  }, [time, timeOnly, long, locale]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: depend on the timestamp, not the Date instance, to avoid recomputing for equivalent dates
  const timeLabel = React.useMemo(() => {
    if (dateOnly) return '';
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
      hour12: false,
    }).format(date);
  }, [time, dateOnly, seconds, locale]);

  const iso = date.toISOString();

  return (
    <span className={blockClass + (className ? ` ${className}` : '')} style={style} title={iso} data-iso={iso}>
      {!timeOnly && (
        <span
          className={dateClass({col: styles.g(0.2)})}
          style={inherit ? {fontSize: '1em', lineHeight: '1.4em'} : undefined}
        >
          {dateLabel}
        </span>
      )}
      {!timeOnly && !dateOnly && <span className={sepClass({bg: styles.g(0, 0.25)})} aria-hidden="true" />}
      {!dateOnly && (
        <span
          className={timeClass({col: styles.g(0.5)})}
          style={inherit ? {fontSize: '0.95em', lineHeight: '1.4em'} : undefined}
        >
          {timeLabel}
        </span>
      )}
    </span>
  );
};
