import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {easing} from '../../styles/easing';
import {useRoundnessTrace} from '../../context';

const ROUNDNESS_MIN_PCT = 10;
const ROUNDNESS_MAX_PCT = 50;
const ROUNDNESS_DEFAULT = 0.5;
const roundnessMapping = easing.mapping(ROUNDNESS_MIN_PCT, ROUNDNESS_MAX_PCT);

const wrapClass = rule({
  pos: 'relative',
  d: 'inline-flex',
  verticalAlign: 'middle',
  flex: '0 0 auto',
});

const inputClass = rule({
  pos: 'absolute',
  top: 0,
  left: 0,
  w: '100%',
  h: '100%',
  mar: 0,
  pad: 0,
  opacity: 0,
  cur: 'inherit',
});

const boxClass = drule({
  d: 'inline-flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  w: '100%',
  h: '100%',
  trs: 'background .12s ease, border-color .12s ease, box-shadow .12s ease',
  '& svg': {d: 'block'},
});

const CheckGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DashGlyph: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 12h12" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

export interface CheckProps {
  /** Controlled checked state. @default false */
  checked?: boolean;
  /** Mixed / indeterminate state — shows a dash and takes visual precedence over `checked`. */
  indeterminate?: boolean;
  /** Fired on user toggle (click / Space). Omit for a purely presentational indicator. */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Non-interactive and dimmed. */
  disabled?: boolean;
  /** Reflects state but cannot be toggled by the user. */
  readOnly?: boolean;
  /** Invalid affordance — red border and focus ring. */
  error?: boolean;
  /** Fill / accent color, any CSS color. @default theme accent */
  color?: string;
  /** Box size in pixels. @default 20 */
  size?: number;
  /** Corner roundness on a `0` … `1` scale: lower is squarer, `1` is a circle.
   * Falls back to an ancestor roundness trace, then {@link ROUNDNESS_DEFAULT}. */
  roundness?: number;
  /** Custom mark shown when checked — an SVG, an emoji, any node. Defaults to a checkmark. */
  icon?: React.ReactNode;
  /** Form field name. */
  name?: string;
  /** Form field value. @default 'on' */
  value?: string;
  /** Input id (associate with an external `<label htmlFor>`). */
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Pointer handler for the whole control (e.g. a row click). */
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

/**
 * A lean, controlled checkbox *indicator*: a styled box over a visually-hidden
 * native checkbox, so it keeps full keyboard/screen-reader semantics and form
 * submission while looking like the design system. It renders from props only —
 * `checked`/`indeterminate` drive the mark (✓ / dash), with `disabled`,
 * `readOnly`, `error`, hover and focus-visible affordances. The checkmark can be
 * replaced via {@link CheckProps.icon} (including an emoji).
 */
export const Check: React.FC<CheckProps> = (props) => {
  const {
    checked = false,
    indeterminate = false,
    onChange,
    disabled,
    readOnly,
    error,
    color,
    size = 20,
    icon,
    name,
    value = 'on',
    id,
    className,
    style,
    onClick,
  } = props;
  const styles = useStyles();
  const roundness = useRoundnessTrace(props.roundness ?? ROUNDNESS_DEFAULT) ?? ROUNDNESS_DEFAULT;
  const ref = React.useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property, not an attribute; it also exposes
  // `aria-checked="mixed"` for free.
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const interactive = !!onChange && !disabled && !readOnly;
  const filled = checked || indeterminate;
  const accent = color ?? styles.accent + '';
  const danger = styles.negative + '';
  const main = error ? danger : accent;
  const borderColor = filled ? main : error ? danger : styles.g(0, 0.25);
  const borderWidth = size < 28 ? 1.5 : 2;
  const iconSize = Math.round(size * 0.66);

  const boxClassName = boxClass({
    bd: `${borderWidth}px solid ${borderColor}`,
    bg: filled ? main : 'transparent',
    col: '#fff',
    [`.${inputClass}:focus-visible + &`]: {
      bxsh: `0 0 0 3px color-mix(in srgb, ${main} 35%, transparent)`,
    },
    ...(interactive
      ? {
          [`.${wrapClass}:hover &`]: {
            borderColor: main,
            bg: filled ? main : `color-mix(in srgb, ${main} 8%, transparent)`,
          },
        }
      : null),
  });

  const mark = indeterminate ? (
    <DashGlyph size={iconSize} />
  ) : checked ? (
    (icon ?? <CheckGlyph size={iconSize} />)
  ) : null;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by the inner native checkbox
    <span
      className={wrapClass + (className ? ` ${className}` : '')}
      style={{
        width: size,
        height: size,
        cursor: disabled ? 'not-allowed' : interactive ? 'pointer' : undefined,
        opacity: disabled ? 0.5 : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      <input
        ref={ref}
        type="checkbox"
        className={inputClass}
        checked={checked}
        disabled={disabled}
        // A controlled checkbox needs an `onChange` or `readOnly`; without a
        // handler it is a presentational indicator driven by `checked`.
        readOnly={readOnly || !onChange}
        name={name}
        value={value}
        id={id}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-describedby={props['aria-describedby']}
        aria-invalid={error || undefined}
        onChange={onChange ? (e) => onChange(e.target.checked, e) : undefined}
      />
      <span
        className={boxClassName}
        style={{borderRadius: roundnessMapping(easing.clamp(roundness)) + '%', fontSize: iconSize}}
        aria-hidden
      >
        {mark}
      </span>
    </span>
  );
};
