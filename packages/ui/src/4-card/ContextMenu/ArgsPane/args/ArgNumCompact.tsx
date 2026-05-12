import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {InputNumber} from '../../../../2-inline-block/InputNumber';
import {SliderHandle} from '../../../../1-inline/SliderHandle';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import {AutoValue} from './AutoValue';
import type {ArgNumProps, DefaultableNumValue} from './ArgNum';

const readStructured = (v: unknown, fallback: number): DefaultableNumValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableNumValue;
    return {def: !!s.def, value: Number(s.value) || fallback};
  }
  return {def: false, value: Number(v) || fallback};
};

export const ArgNumCompact: React.FC<ArgNumProps> = ({param, value, onChange}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

  const defaultable = !!param.defaultable;
  const fallback = (param.default as number | undefined) ?? 0;
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;

  const emit = (next: DefaultableNumValue) => {
    if (defaultable) onChange(next);
    else onChange(next.value);
  };
  const setControlValue = (n: number) => emit({def: false, value: n});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const customControl = (
    <div style={{width: 120, margin: '-5px 0'}}>
      <InputNumber
        inputProps={{size: -3}}
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

  const autoDisplay = (
    <AutoValue onClick={enterCustom}>
      <span style={{fontVariantNumeric: 'tabular-nums'}}>{fallback}</span>
    </AutoValue>
  );

  const right = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: -8}}>
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
  ) : (
    <div style={{width: 120, marginRight: -8}}>{customControl}</div>
  );

  return (
    <ContextItem icon={param.icon?.()} control inset right={right}>
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
