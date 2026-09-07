import {drule} from 'nano-theme';
import * as React from 'react';
import {Check} from '../../../1-inline/Check';
import {Checkbox} from '../../../2-inline-block/Checkbox';
import {useStyles} from '../../../styles/context';
import type {ParamBool} from '../../StructuralMenu/types';
import {DefaultableToggle} from './DefaultableToggle';

const toggleClass = drule({
  cur: 'pointer',
  d: 'inline-flex',
  ai: 'center',
  gap: '8px',
  bdrad: '6px',
  out: 0,
});

export interface DefaultableBoolValue {
  def: boolean;
  value: boolean | null;
}

export interface ArgBoolProps {
  param: ParamBool;
  value: boolean | DefaultableBoolValue;
  onChange: (value: boolean | DefaultableBoolValue) => void;
  /**
   * Which edge of the value cell the control sits at. The optional
   * `param.label` renders on the free-space side — after the control when
   * `'left'`, before it when `'right'` — so the control stays pinned to its
   * edge across rows. @default 'left'
   */
  align?: 'left' | 'right';
}

const autoWrapStyle = (hover: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  opacity: hover ? 1 : 0.5,
  transition: 'opacity .12s',
});

const readStructured = (v: unknown, fallback: boolean): DefaultableBoolValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableBoolValue;
    return {def: !!s.def, value: !!s.value};
  }
  return {def: false, value: typeof v === 'boolean' ? v : v === null ? v : fallback};
};

/** Value semantics and actions shared by {@link ArgBool} and `ArgBoolReveal`. */
export const boolArg = (param: ParamBool, value: ArgBoolProps['value'], onChange: ArgBoolProps['onChange']) => {
  const defaultable = !!param.defaultable;
  const fallback = !!(param.default as boolean | undefined);
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;
  const emit = (next: DefaultableBoolValue) => {
    if (defaultable) onChange(next);
    else onChange(!!next.value);
  };
  return {
    defaultable,
    fallback,
    s,
    def,
    /** Effective displayed state; `null` is the indeterminate/unset state. */
    state: def ? fallback : s.value,
    toggleValue: () => emit({def: false, value: !s.value}),
    enterCustom: () => emit({def: false, value: s.value}),
    revertToAuto: () => emit({def: true, value: s.value}),
  };
};

/** Value-only checkbox control. The definition cell is rendered by `FieldRow`. */
export const ArgBool: React.FC<ArgBoolProps> = ({param, value, onChange, align = 'left'}) => {
  const styles = useStyles();
  const [hover, setHover] = React.useState(false);

  const {defaultable, fallback, s, def, state, toggleValue, enterCustom, revertToAuto} = boolArg(
    param,
    value,
    onChange,
  );
  const variant = param.variant ?? 'switch';

  const checkbox = (on: boolean | null) => (
    <span style={{display: 'inline-flex', margin: '-5px 0'}}>
      {variant === 'check' ? (
        <Check size={20} checked={typeof on !== 'boolean' ? void 0 : on} indeterminate={typeof on !== 'boolean'} />
      ) : (
        <Checkbox as="div" small on={on} />
      )}
    </span>
  );

  const labelNode = param.label ? param.label(state) : undefined;
  const hasLabel = labelNode !== undefined && labelNode !== null;
  const labelAfter = hasLabel && align === 'left';
  const label = hasLabel ? <span style={{whiteSpace: 'nowrap'}}>{labelNode}</span> : null;

  const content = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
      {def ? (
        <>
          <DefaultableToggle def onClick={enterCustom} />
          <span style={autoWrapStyle(hover)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {checkbox(fallback)}
          </span>
        </>
      ) : (
        <>
          <DefaultableToggle def={false} onClick={revertToAuto} />
          {checkbox(s.value)}
        </>
      )}
    </span>
  ) : (
    checkbox(s.value)
  );

  // Clicking the value cell toggles (or enters custom when in auto mode). The
  // DefaultableToggle stops propagation, so it keeps its own behavior. The
  // click is consumed here so a wrapping cell (ArgBoolReveal) can also toggle
  // on clicks outside the control without double-toggling.
  return (
    <span
      className={toggleClass({
        '&:focus-visible': {bxsh: `0 0 0 3px color-mix(in srgb, ${styles.accent + ''} 35%, transparent)`},
      })}
      role="checkbox"
      aria-checked={state === null ? 'mixed' : !!state}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        (def ? enterCustom : toggleValue)();
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          (def ? enterCustom : toggleValue)();
        }
      }}
    >
      {!labelAfter && label}
      {content}
      {labelAfter && label}
    </span>
  );
};
