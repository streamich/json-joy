import * as React from 'react';
import {useT} from 'use-t';
import {ContextItem} from '../../ContextItem';
import {ContextMenu} from '../../ContextMenu';
import {PopupControlled} from '../../../Popup/PopupControlled';
import {context as popupCtx} from '../../../Popup/context';
import {anchorContext, useAnchorPointHandle} from '../../../../utils/popup';
import {useLockScrolling} from '../../../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../../../hooks/useSingletonPopup';
import {Iconista} from '../../../../icons/Iconista';
import {useStyles} from '../../../../styles/context';
import {OptionalBadge} from './OptionalBadge';
import {DefaultableToggle} from './DefaultableToggle';
import {AutoValue} from './AutoValue';
import type {MenuItem} from '../../../StructuralMenu/types';
import type {ArgSelectProps, DefaultableSelectValue} from './ArgSelect';

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
          right: isSelected ? () => <Iconista width={14} height={14} set="radix" icon="check" /> : opt.right,
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

  const popup = useSingletonPopup('arg-select');
  const closePopup = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close: closePopup}), [closePopup]);
  const anchorHandle = useAnchorPointHandle({pinX: 'right'});
  useLockScrolling(popup.open);

  const dropRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!popup.open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const tog = anchorHandle.toggle;
      const drop = dropRef.current;
      if (tog && tog.contains(target)) return;
      if (drop && drop.contains(target)) return;
      closePopup();
    };
    // Listen in capture so we run before any internal mousedown handlers call stopPropagation.
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [popup.open, anchorHandle, closePopup]);

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
    <popupCtx.Provider value={popupContextValue}>
      <anchorContext.Provider value={anchorHandle}>
        <PopupControlled
          block
          open={popup.open}
          refToggle={anchorHandle.ref}
          onHeadClick={() => popup.setOpen(!popup.open)}
          onClickAway={closePopup}
          onEsc={popup.open ? closePopup : undefined}
          renderContext={() => (
            <div ref={dropRef}>
              <ContextMenu inset showSearch={showSearch} searchPlaceholder={param.searchPlaceholder} menu={menu} />
            </div>
          )}
        >
          <ContextItem
            icon={param.icon?.()}
            control
            inset
            nested
            onClick={() => {}}
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
        </PopupControlled>
      </anchorContext.Provider>
    </popupCtx.Provider>
  );
};
