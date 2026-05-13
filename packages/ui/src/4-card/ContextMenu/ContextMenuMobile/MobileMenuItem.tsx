import * as React from 'react';
import {useStyles} from '../../../styles/context';
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
  const styles = useStyles();
  const active = !!useSyncStoreOpt(item.active);
  const disabled = !!useSyncStoreOpt(item.disabled);
  const visibleStore = useSyncStoreOpt(item.visible);
  if (item.visible && visibleStore === false) return null;
  const hasArgs = !!item.params?.length;
  const hasChildren = !!item.children?.length;
  const hasPane = !!item.pane;
  const hasRaw = !!item.raw;
  const navigable = hasChildren || hasPane || hasRaw;
  const display = item.display?.() ?? t(item.name);

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return;
    if (hasArgs) {
      onSelectArgs(item);
      return;
    }
    if (hasPane || hasRaw) {
      onPush(item);
      return;
    }
    if (item.onSelect) {
      item.onSelect(event);
      if (!item.keepOpen) onClose();
      return;
    }
    if (hasChildren) {
      onPush(item);
    }
  };

  const danger = !!item.danger;
  const dangerColor = styles.col.get('error', 'el-2');
  const baseColor = styles.g(styles.light ? 0.15 : 0.1);

  const hasControl = !!item.control;

  const rowStyle: React.CSSProperties = {
    color: danger ? dangerColor : baseColor,
    pointerEvents: disabled ? 'none' : undefined,
    opacity: disabled ? 0.45 : 1,
    background: active ? styles.g(0, styles.light ? 0.05 : 0.08) : undefined,
    paddingTop: hasControl ? 10 : undefined,
    paddingBottom: hasControl ? 10 : undefined,
  };

  const description = item.description ? t(item.description) : null;
  const right = item.control?.() ?? item.right?.();
  const noteFn = item.note;
  const keys = item.keys;
  const inert = !item.onSelect && !hasArgs && !hasPane && !hasRaw && !hasChildren;

  let labelEl: React.ReactNode = display;
  if (item.mono) labelEl = <code style={{fontFamily: 'monospace', fontSize: '.95em'}}>{labelEl}</code>;
  if (item.more)
    labelEl = (
      <span>
        {labelEl}
        <span style={{opacity: 0.4}}> …</span>
      </span>
    );

  const Tag: any = inert ? 'div' : 'button';
  const interactiveProps = inert
    ? {}
    : {
        type: 'button',
        onClick: handleClick,
        disabled,
        role: 'menuitem',
        'aria-haspopup': navigable ? 'menu' : undefined,
        'aria-disabled': disabled || undefined,
      };

  return (
    <Tag className={itemRowClass()} style={rowStyle} {...interactiveProps}>
      <span className={itemIconClass}>{item.icon?.()}</span>
      <span className={itemMainClass}>
        <span className={itemLabelClass}>
          {labelEl}
          {noteFn && <span style={{marginInlineStart: 6, opacity: 0.6}}>{noteFn()}</span>}
        </span>
        {description && <span className={itemDescriptionClass({col: styles.g(0.5)})}>{description}</span>}
      </span>
      {right && <span className={itemRightClass}>{right}</span>}
      {keys && keys.length > 0 && (
        <span className={itemKeysClass({col: styles.g(0.45)})}>
          {keys.map((k, i) => (
            <span
              key={i}
              className={keyChipClass({
                bg: styles.g(0, 0.06),
                col: styles.g(0.4),
              })}
            >
              {k}
            </span>
          ))}
        </span>
      )}
      {navigable && !item.onSelect && (
        <span className={chevronClass} aria-hidden="true">
          <Arrow direction="r" style={{width: 16, height: 16}} />
        </span>
      )}
    </Tag>
  );
};
