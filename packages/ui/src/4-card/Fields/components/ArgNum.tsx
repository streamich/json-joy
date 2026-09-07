import * as React from 'react';
import {Meta} from '../../../1-inline/Meta';
import {SliderHandle} from '../../../1-inline/SliderHandle';
import type {InputProps} from '../../../2-inline-block/Input';
import {InputNumber} from '../../../2-inline-block/InputNumber';
import {useSpacingTrace} from '../../../context/traces';
import type {ParamNum} from '../../StructuralMenu/types';
import {numInvalid} from '../num';
import {AutoValue} from './AutoValue';
import {DefaultableToggle} from './DefaultableToggle';

export interface DefaultableNumValue {
  def: boolean;
  value: number;
}

export interface ArgNumProps extends Omit<InputProps, 'value' | 'onChange'> {
  param: ParamNum;
  value: number | DefaultableNumValue | undefined;
  onChange: (value: number | DefaultableNumValue) => void;
  /** Fill the available width (reveal editor): control left, unit right. */
  stretch?: boolean;
}

const readStructured = (v: unknown, fallback: number): DefaultableNumValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableNumValue;
    return {def: !!s.def, value: Number(s.value) || fallback};
  }
  return {def: false, value: Number(v) || fallback};
};

/** Value-only number control. The definition cell (icon + name) is rendered by `FieldRow`. */
export const ArgNum: React.FC<ArgNumProps> = ({param, value, onChange, onEnter, focus, stretch}) => {
  const size = useSpacingTrace(0.5) >= 0.7 ? -1 : -3;
  const defaultable = !!param.defaultable;
  const fallback = (param.default as number | undefined) ?? 0;
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;
  const invalid = numInvalid(param, s.value);

  const emit = (next: DefaultableNumValue) => {
    if (defaultable) onChange(next);
    else onChange(next.value);
  };
  const setControlValue = (n: number) => emit({def: false, value: n});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const stepper = (
    <div style={{width: 120, margin: '-5px 0'}}>
      <InputNumber
        inputProps={{size, onEnter, focus, invalid}}
        min={param.min}
        max={param.max}
        step={param.step}
        decimals={param.decimals}
        dragSensitivity={param.dragSensitivity}
        dragAxis={param.dragAxis}
        value={s.value}
        drag
        dragHandle={<SliderHandle />}
        onChangeEnd={setControlValue}
      />
    </div>
  );
  const customControl = !param.unit ? (
    stepper
  ) : (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        width: stretch ? '100%' : undefined,
        justifyContent: stretch ? 'space-between' : undefined,
        paddingRight: stretch ? 6 : undefined,
      }}
    >
      {stepper}
      <Meta>{param.unit}</Meta>
    </span>
  );

  if (!defaultable) return customControl;

  const autoDisplay = (
    <AutoValue onClick={enterCustom}>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>
        {fallback}
        {param.unit ? ` ${param.unit}` : ''}
      </span>
    </AutoValue>
  );

  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
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
