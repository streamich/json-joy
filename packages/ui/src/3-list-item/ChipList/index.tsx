import {rule} from 'nano-theme';
import * as React from 'react';
import {Chip} from '../../1-inline/Chip';
import {Meta} from '../../1-inline/Meta';
import type {MenuItem} from '../../4-card/StructuralMenu/types';

const rootClass = rule({
  d: 'inline-flex',
  ai: 'center',
  minWidth: 0,
  ov: 'hidden',
});

const moreClass = rule({
  flexShrink: 0,
});

const itemId = (item: MenuItem): string => (item.id ?? item.name) as string;
const itemLabel = (item: MenuItem): React.ReactNode => item.display?.() ?? item.name ?? item.id ?? '';

export interface ItemChipProps {
  /** The item to render — `display`/`name` is the label; `icon`/`color` decorate it. */
  item: MenuItem;
  /** Smaller size variant. */
  small?: boolean;
  /** When set, the chip is removable; fires with the item's id (or name). */
  onRemove?: (id: string) => void;
}

/** Renders a single {@link MenuItem} as a {@link Chip}. */
export const ItemChip: React.FC<ItemChipProps> = ({item, small, onRemove}) => (
  <Chip
    small={small}
    icon={item.icon?.()}
    color={item.color}
    onRemove={onRemove ? () => onRemove(itemId(item)) : undefined}
  >
    {itemLabel(item)}
  </Chip>
);

export interface ChipListProps {
  /** Items to render as chips, in order. */
  items: MenuItem[];
  /** Cap the number of chips shown; the rest collapse into a "+K" counter. */
  max?: number;
  /** Smaller chip size. */
  small?: boolean;
  /** Gap between chips in px. @default 4 */
  gap?: number;
  /** When set, chips are removable; fires with the removed item's id (or name). */
  onRemove?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * An inline, single-line list of {@link MenuItem}s rendered as {@link Chip}s,
 * truncated to `max` with a trailing "+K" overflow counter. Used for tag /
 * multi-select value displays.
 */
export const ChipList: React.FC<ChipListProps> = ({items, max, small, gap = 4, onRemove, className, style}) => {
  const shown = max != null ? items.slice(0, max) : items;
  const extra = items.length - shown.length;
  return (
    <span className={rootClass + (className ? ` ${className}` : '')} style={{gap, ...style}}>
      {shown.map((item) => (
        <ItemChip key={itemId(item)} item={item} small={small} onRemove={onRemove} />
      ))}
      {extra > 0 && (
        <Meta className={moreClass} size={small ? 12 : 13}>
          +{extra}
        </Meta>
      )}
    </span>
  );
};
