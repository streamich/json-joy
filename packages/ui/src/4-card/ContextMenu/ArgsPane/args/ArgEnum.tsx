import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {ToolbarItem} from '../../../Toolbar/ToolbarItem';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import {AutoValue} from './AutoValue';
import type {ParamEnum} from '../../../StructuralMenu/types';

export interface DefaultableEnumValue {
  def: boolean;
  value: string;
}

export interface ArgEnumProps {
  param: ParamEnum;
  value: string | DefaultableEnumValue;
  compact?: boolean;
  onChange: (value: string | DefaultableEnumValue) => void;
}

const readStructured = (v: unknown): DefaultableEnumValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableEnumValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

export const ArgEnum: React.FC<ArgEnumProps> = ({param, value, onChange}) => {
  const [t] = useT();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  const options = param.options ?? [];

  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;

  const emit = (next: DefaultableEnumValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  const setValue = (id: string) => emit({def: false, value: id});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const defaultId = (param.default as string | undefined) ?? '';

  const toolbar = (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 2}}>
      {options.map((opt) => {
        const id = opt.id ?? opt.name ?? '';
        const isSelected = id === s.value;
        return (
          <ToolbarItem
            key={id}
            small
            fill
            selected={isSelected}
            tooltip={{renderTooltip: () => t(opt.name ?? id)}}
            onClick={() => setValue(id)}
          >
            {opt.icon?.()}
          </ToolbarItem>
        );
      })}
    </span>
  );

  const autoSelected = options.find((o) => (o.id ?? o.name) === defaultId);
  const autoLabel = autoSelected
    ? autoSelected.display?.() ?? t(autoSelected.name ?? defaultId)
    : '—';

  const right = defaultable ? (
    def ? (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: -4}}>
        <DefaultableToggle def onClick={enterCustom} />
        <AutoValue onClick={enterCustom}>
          <span>{autoLabel}</span>
          {autoSelected?.icon ? (
            <span style={{display: 'inline-flex', marginInlineStart: 6}}>{autoSelected.icon()}</span>
          ) : null}
        </AutoValue>
      </span>
    ) : (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 4, margin: '-5px -8px -5px 0'}}>
        <DefaultableToggle def={false} onClick={revertToAuto} />
        {toolbar}
      </span>
    )
  ) : (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 2, margin: '-5px -8px -5px 0'}}>
      {toolbar}
    </span>
  );

  return (
    <ContextItem
      icon={param.icon?.()}
      control
      compact
      inset
      style={{paddingTop: 6, paddingBottom: 6}}
      right={right}
    >
      <span>
        {label}
        {param.optional && <OptionalBadge />}
      </span>
    </ContextItem>
  );
};
