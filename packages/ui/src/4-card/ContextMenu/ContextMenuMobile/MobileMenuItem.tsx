import * as React from 'react';
import {useTheme} from 'nano-theme';
import {useT} from 'use-t';
import Arrow from '../../../icons/interactive/Arrow';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';
import {
  itemRowClass,
  itemIconClass,
  itemMainClass,
  itemLabelClass,
  itemDescriptionClass,
  itemRightClass,
  itemKeysClass,
  keyChipClass,
  chevronClass,
} from './styles';
import type {MenuItem} from '../../StructuralMenu/types';

export interface MobileMenuItemProps {
  item: MenuItem;
  onPush: (item: MenuItem) => void;
  onSelectArgs: (item: MenuItem) => void;
  onClose: () => void;
}

export const MobileMenuItem: React.FC<MobileMenuItemProps> = ({item, onPush, onSelectArgs, onClose}) => {
  const [t] = useT();
  const theme = useTheme();
  const active = !!useSyncStoreOpt(item.active);
  const disabled = !!useSyncStoreOpt(item.disabled);
  const hasArgs = !!item.params?.length;
  const hasChildren = !!item.children?.length;
  const display = item.display?.() ?? t(item.name);

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return;
    if (hasArgs) {
      onSelectArgs(item);
      return;
    }
    if (item.onSelect) {
      item.onSelect(event);
      onClose();
      return;
    }
    if (hasChildren) {
      onPush(item);
    }
  };

  const danger = !!item.danger;
  const dangerColor = theme.color.sem.negative[1];
  const baseColor = theme.g(theme.isLight ? 0.15 : .1);

  const rowStyle: React.CSSProperties = {
    color: danger ? dangerColor : baseColor,
    pointerEvents: disabled ? 'none' : undefined,
    opacity: disabled ? 0.45 : 1,
    background: active ? (theme.g(0, theme.isLight ? 0.05 : 0.08)) : undefined,
  };

  const description = item.description ? t(item.description) : null;
  const right = item.right?.();
  const noteFn = item.note;
  const keys = item.keys;

  let labelEl: React.ReactNode = display;
  if (item.mono) labelEl = <code style={{fontFamily: 'monospace', fontSize: '.95em'}}>{labelEl}</code>;
  if (item.more)
    labelEl = (
      <span>
        {labelEl}
        <span style={{opacity: 0.4}}> …</span>
      </span>
    );

  return (
    <button
      type="button"
      className={itemRowClass()}
      style={rowStyle}
      onClick={handleClick}
      disabled={disabled}
      role="menuitem"
      aria-haspopup={hasChildren ? 'menu' : undefined}
      aria-disabled={disabled || undefined}
    >
      <span className={itemIconClass}>{item.icon?.()}</span>
      <span className={itemMainClass}>
        <span className={itemLabelClass}>
          {labelEl}
          {noteFn && <span style={{marginInlineStart: 6, opacity: 0.6}}>{noteFn()}</span>}
        </span>
        {description && <span className={itemDescriptionClass({col: theme.g(0.5)})}>{description}</span>}
      </span>
      {right && <span className={itemRightClass}>{right}</span>}
      {keys && keys.length > 0 && (
        <span className={itemKeysClass({col: theme.g(0.45)})}>
          {keys.map((k, i) => (
            <span
              key={i}
              className={keyChipClass({
                bg: theme.g(0, 0.06),
                col: theme.g(0.4),
              })}
            >
              {k}
            </span>
          ))}
        </span>
      )}
      {hasChildren && !item.onSelect && (
        <span className={chevronClass} aria-hidden="true">
          <Arrow direction="r" style={{width: 16, height: 16}} />
        </span>
      )}
    </button>
  );
};
