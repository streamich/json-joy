import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {Input} from '../../../../2-inline-block/Input';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import {AutoValue} from './AutoValue';
import type {ArgStrProps, DefaultableStrValue} from './ArgStr';

const readStructured = (v: unknown): DefaultableStrValue => {
  if (v && typeof v === 'object' && 'def' in (v as object)) {
    const s = v as DefaultableStrValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

export const ArgStrCompact: React.FC<ArgStrProps> = ({param, value, onChange, onEnter, focus}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;
  const handleEnter: React.KeyboardEventHandler = (event) => {
    onEnter?.(event);
    param.onSubmit?.();
  };

  const emit = (next: DefaultableStrValue) => {
    if (defaultable) onChange(next);
    else onChange(next.value);
  };
  const setText = (v: string) => emit({def: false, value: v});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const customControl = (
    <div style={{width: 140, margin: '-5px -8px -5px 0'}}>
      <Input
        size={-3}
        type="text"
        value={s.value}
        placeholder={param.placeholder}
        focus={focus}
        onChange={setText}
        onEnter={handleEnter}
      />
    </div>
  );

  const autoDisplay = (
    <AutoValue onClick={enterCustom}>
      <span style={{fontSize: 13}}>{(param.default as string | undefined) || t('auto')}</span>
    </AutoValue>
  );

  const right = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, margin: '-5px -4px -5px 0'}}>
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
    customControl
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
