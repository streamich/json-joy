import {drule} from 'nano-theme';
import * as React from 'react';
import {Meta} from '../../../../1-inline/Meta';
import {useLockScrolling} from '../../../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../../../hooks/useSingletonPopup';
import Arrow from '../../../../icons/interactive/Arrow';
import {useStyles} from '../../../../styles/context';
import {anchorContext, useAnchorPointHandle} from '../../../../utils/popup';
import {context as popupCtx} from '../../../Popup/context';
import {PopupControlled} from '../../../Popup/PopupControlled';
import type {ParamSelect} from '../../../StructuralMenu/types';
import {AutoValue} from '../AutoValue';
import {DefaultableToggle} from '../DefaultableToggle';
import {SelectMenuBody} from './SelectMenuBody';
import {isMultiple, optionLabel, readMulti, type SelectValue, selectArg} from './utils';

const triggerClass = drule({
  d: 'inline-flex',
  ai: 'center',
  gap: '4px',
  cur: 'pointer',
  bdrad: '5px',
  pd: '3px 6px',
  trs: 'background .12s',
});

const ellipsisStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: 160,
};

export interface ArgSelectProps {
  param: ParamSelect;
  value: SelectValue;
  onChange: (value: SelectValue) => void;
  onSubmit: () => void;
}

/**
 * Value-only select control. The value cell is a clickable trigger showing the
 * selected option(s); clicking it opens the options dropdown. The definition
 * cell (icon + name) is rendered by `FieldRow`.
 */
export const ArgSelect: React.FC<ArgSelectProps> = ({param, value, onChange}) => {
  const styles = useStyles();
  const multi = isMultiple(param);
  const options = param.options ?? [];

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

  const withPopup = (trigger: React.ReactNode): React.ReactNode => (
    <popupCtx.Provider value={popupContextValue}>
      <anchorContext.Provider value={anchorHandle}>
        <PopupControlled
          open={popup.open}
          refToggle={anchorHandle.ref}
          onHeadClick={() => popup.setOpen(!popup.open)}
          onClickAway={closePopup}
          onEsc={popup.open ? closePopup : undefined}
          renderContext={() => (
            <div ref={dropRef}>
              <SelectMenuBody param={param} value={value} onChange={onChange as (v: unknown) => void} />
            </div>
          )}
        >
          {trigger}
        </PopupControlled>
      </anchorContext.Provider>
    </popupCtx.Provider>
  );

  const triggerProps: React.HTMLAttributes<HTMLSpanElement> = {
    role: 'button',
    tabIndex: 0,
    'aria-haspopup': 'menu',
    'aria-expanded': popup.open,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        popup.setOpen(!popup.open);
      }
    },
  };
  const triggerCls = triggerClass({
    '&:hover': {bg: styles.g(0, 0.06)},
    '&:focus-visible': {bg: styles.g(0, 0.06)},
  });

  // --------------------------------------------------------------- Multi mode
  if (multi) {
    const values = readMulti(value, param);
    const summary =
      values.length === 0 ? (
        '—'
      ) : values.length === 1 ? (
        optionLabel(param, values[0])
      ) : (
        <>
          <span style={{fontVariantNumeric: 'tabular-nums'}}>{values.length}</span> <Meta>selected</Meta>
        </>
      );
    const trigger = (
      <span {...triggerProps} className={triggerCls} style={{marginRight: -6}}>
        <span style={{...ellipsisStyle, color: styles.g(0.15)}}>{summary}</span>
        <Arrow direction="d" size={12} aria-hidden />
      </span>
    );
    return <>{withPopup(trigger)}</>;
  }

  // -------------------------------------------------------------- Single mode
  const {defaultable, s, def, enterCustom, revertToAuto} = selectArg(param, value, onChange);
  const defaultId = (param.default as string | undefined) ?? '';
  const displayId = def ? defaultId : s.value;
  const selected = options.find((o) => (o.id ?? o.name) === displayId);
  const selectedLabel = selected ? (selected.display?.() ?? selected.name ?? selected.id ?? '') : '—';
  const selectedIcon = selected?.icon ? selected.icon() : null;

  const labelWithIcon = (color: string) => (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, color}}>
      <span style={ellipsisStyle}>{selectedLabel}</span>
      {selectedIcon && <span style={{display: 'inline-flex'}}>{selectedIcon}</span>}
    </span>
  );

  if (defaultable && def) {
    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by the inner AutoValue and DefaultableToggle
      <span
        style={{display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: -8, cursor: 'pointer'}}
        onClick={enterCustom}
      >
        <DefaultableToggle def onClick={enterCustom} />
        <AutoValue onClick={enterCustom}>{labelWithIcon('inherit')}</AutoValue>
      </span>
    );
  }

  const trigger = (
    <span {...triggerProps} className={triggerCls} style={{marginRight: -6}}>
      {labelWithIcon(styles.g(0.15))}
      <Arrow direction="d" size={12} aria-hidden />
    </span>
  );

  if (!defaultable) return <>{withPopup(trigger)}</>;

  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <DefaultableToggle def={false} onClick={revertToAuto} />
      {withPopup(trigger)}
    </span>
  );
};
