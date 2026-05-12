import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {Checkbox} from '../../../../2-inline-block/Checkbox';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import type {ArgBoolProps, DefaultableBoolValue} from './ArgBool';

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
  return {def: false, value: typeof v === 'boolean' ? v : fallback};
};

export const ArgBoolCompact: React.FC<ArgBoolProps> = ({param, value, onChange}) => {
  const [t] = useT();
  const [hover, setHover] = React.useState(false);
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');

  const defaultable = !!param.defaultable;
  const fallback = !!(param.default as boolean | undefined);
  const s = readStructured(value, fallback);
  const def = defaultable && s.def;

  const emit = (next: DefaultableBoolValue) => {
    if (defaultable) onChange(next);
    else onChange(next.value);
  };
  const toggleValue = () => emit({def: false, value: !s.value});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const checkbox = (on: boolean) => (
    <span style={{display: 'inline-flex', margin: '-5px 0'}}>
      <Checkbox as="div" small on={on} />
    </span>
  );

  const right = defaultable ? (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: -8}}>
      {def ? (
        <>
          <DefaultableToggle def onClick={enterCustom} />
          <span
            style={autoWrapStyle(hover)}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
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

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      inset
      onClick={defaultable && def ? enterCustom : toggleValue}
      style={{paddingTop: 8, paddingBottom: 8}}
      right={right}
    >
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
