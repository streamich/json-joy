import * as React from 'react';
import {useT} from 'use-t';
import type {InputProps} from '../../../2-inline-block/Input';
import {Input} from '../../../2-inline-block/Input';
import {useSpacingTrace} from '../../../context/traces';
import type {ParamStr} from '../../StructuralMenu/types';
import {strInvalid} from '../str';
import {AutoValue} from './AutoValue';
import {DefaultableToggle} from './DefaultableToggle';

export interface DefaultableStrValue {
  def: boolean;
  value: string;
}

export interface ArgStrProps extends Omit<InputProps, 'value' | 'onChange'> {
  param: ParamStr;
  value: string | DefaultableStrValue;
  onChange: (value: string | DefaultableStrValue) => void;
  /** Fill the available width (reveal editor); otherwise a fixed 140px box. */
  stretch?: boolean;
}

const readStructured = (v: unknown): DefaultableStrValue => {
  if (v && typeof v === 'object' && 'def' in (v as object)) {
    const s = v as DefaultableStrValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

/** Value-only string control. The definition cell (icon + name) is rendered by `FieldRow`. */
export const ArgStr: React.FC<ArgStrProps> = ({param, value, onChange, onEnter, focus, stretch}) => {
  const [t] = useT();
  const [invalid, setInvalid] = React.useState(false);
  const size = useSpacingTrace(0.5) >= 0.7 ? -1 : -3;
  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;
  const ml = param.multiline;
  const handleEnter: React.KeyboardEventHandler = (event) => {
    onEnter?.(event);
    param.onSubmit?.();
  };

  const emit = (next: DefaultableStrValue) => {
    if (defaultable) onChange(next);
    else onChange(next.value);
  };
  const setText = (v: string) => {
    emit({def: false, value: v});
    if (invalid) setInvalid(strInvalid(param, v)); // clear as soon as the value is fixed
  };
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const customControl = (
    <div style={{width: stretch ? '100%' : 140, margin: ml ? 0 : '-5px 0'}}>
      <Input
        size={size}
        type="text"
        multiline={!!ml}
        rows={typeof ml === 'object' ? (ml.min ?? 3) : 3}
        maxRows={typeof ml === 'object' ? (ml.max ?? 10) : 10}
        invalid={invalid}
        value={s.value}
        placeholder={param.placeholder}
        focus={focus}
        onChange={setText}
        onEnter={handleEnter}
        onBlur={() => setInvalid(strInvalid(param, s.value))}
      />
    </div>
  );

  if (!defaultable) return customControl;

  const autoDisplay = (
    <AutoValue onClick={enterCustom}>
      <span style={{fontSize: 13}}>{(param.default as string | undefined) || t('auto')}</span>
    </AutoValue>
  );

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        margin: '-5px 0',
        width: stretch ? '100%' : undefined,
      }}
    >
      {def ? (
        <>
          <DefaultableToggle def onClick={enterCustom} />
          {autoDisplay}
        </>
      ) : (
        <>
          <DefaultableToggle def={false} onClick={revertToAuto} />
          {customControl}
        </>
      )}
    </span>
  );
};
