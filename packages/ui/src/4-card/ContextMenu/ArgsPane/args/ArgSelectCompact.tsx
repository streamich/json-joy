import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {ContextMenu} from '../../ContextMenu';
import {Popup} from '../../../Popup';
import {Iconista} from '../../../../icons/Iconista';
import {useStyles} from '../../../../styles/context';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import {AutoValue} from './AutoValue';
import type {MenuItem} from '../../../StructuralMenu/types';
import type {ArgSelectProps, DefaultableSelectValue} from './ArgSelect';

const noop = () => {};

const readStructured = (v: unknown): DefaultableSelectValue => {
  if (v && typeof v === 'object' && 'def' in v) {
    const s = v as DefaultableSelectValue;
    return {def: !!s.def, value: String(s.value ?? '')};
  }
  return {def: false, value: typeof v === 'string' ? v : ''};
};

export const ArgSelectCompact: React.FC<ArgSelectProps> = ({param, value, onChange}) => {
  const [t] = useT();
  const styles = useStyles();
  const label = param.display?.() ?? t(param.name ?? param.id ?? '');
  const options = param.options ?? [];

  const defaultable = !!param.defaultable;
  const s = readStructured(value);
  const def = defaultable && s.def;

  const emit = (next: DefaultableSelectValue) => {
    if (defaultable) onChange?.(next);
    else onChange?.(next.value);
  };
  const setValue = (id: string) => emit({def: false, value: id});
  const enterCustom = () => emit({def: false, value: s.value});
  const revertToAuto = () => emit({def: true, value: s.value});

  const defaultId = (param.default as string | undefined) ?? '';
  const displayId = def ? defaultId : s.value;
  const selected = options.find((o) => (o.id ?? o.name) === displayId);
  const selectedLabel = selected ? (selected.display?.() ?? selected.name ?? selected.id ?? '') : '—';

  const menu = React.useMemo<MenuItem>(
    () => ({
      name: param.name ?? param.id ?? '',
      noHeader: true,
      minWidth: 220,
      children: options.map((opt) => {
        const id = opt.id ?? opt.name;
        const isSelected = id === s.value;
        return {
          ...opt,
          onSelect: () => setValue(id ?? ''),
          right: isSelected
            ? () => <Iconista width={14} height={14} set="radix" icon="check" />
            : opt.right,
        };
      }),
    }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: setValue identity not material
    [options, param.name, param.id, s.value],
  );

  const ellipsisStyle: React.CSSProperties = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 160,
  };

  const selectedIcon = selected?.icon ? selected.icon() : null;

  const labelWithIcon = (color: string) => (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color}}>
      <span style={ellipsisStyle}>{selectedLabel}</span>
      {selectedIcon && <span style={{display: 'inline-flex'}}>{selectedIcon}</span>}
    </span>
  );

  if (defaultable && def) {
    return (
      <ContextItem
        icon={param.icon?.()}
        control
        inset
        onClick={enterCustom}
        style={{paddingTop: 9, paddingBottom: 9}}
        right={
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: -8}}>
            <DefaultableToggle def onClick={enterCustom} />
            <AutoValue onClick={enterCustom}>{labelWithIcon('inherit')}</AutoValue>
          </span>
        }
      >
        <span>
          {label}
          {param.optional && <OptionalBadge />}
        </span>
      </ContextItem>
    );
  }

  const customLabel = labelWithIcon(styles.g(0.15));

  const showSearch = param.showSearch ?? options.length >= 6;

  return (
    <Popup
      block
      renderContext={() => (
        <ContextMenu
          showSearch={showSearch}
          searchPlaceholder={param.searchPlaceholder}
          menu={menu}
        />
      )}
    >
      <ContextItem
        icon={param.icon?.()}
        control
        inset
        nested
        onClick={noop}
        style={{paddingTop: 9, paddingBottom: 9}}
        right={
          defaultable ? (
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
              <DefaultableToggle def={false} onClick={revertToAuto} />
              {customLabel}
            </span>
          ) : (
            customLabel
          )
        }
      >
        <span>
          {label}
          {param.optional && <OptionalBadge />}
        </span>
      </ContextItem>
    </Popup>
  );
};
