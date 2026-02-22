import * as React from 'react';
import type {SyncStore} from '../../types';

export interface MenuItem {
  /** Name of the item. */
  name: string;

  /** Whether this item is a separator. */
  sep?: boolean;

  /** Whether to add a separator before this item. */
  sepBefore?: boolean;

  /** Extra small description or UI element, displayed next to the name. */
  note?: () => React.ReactNode;

  /** Text by which to search for this item, defaults to `name`. */
  text?: string;

  /**
   * Unique identifier of the item. Unique with the parent panel.
   *
   * @default name
   */
  id?: string;

  /** Color of the item. If not provided, computed from `id`.  */
  color?: string;

  /**
   * Rich text used to display the item.
   *
   * @default name
   */
  display?: () => React.ReactNode;

  /**
   * Small icon displayed next to the item.
   */
  icon?: () => React.ReactNode;

  /**
   * Large icon, typically over 64px in size.
   */
  iconBig?: () => React.ReactNode;

  /** Something to display on the right side. */
  right?: () => React.ReactNode;

  /** Keyboard shortcut key combination. */
  keys?: string[];

  /** Children of this item. */
  children?: MenuItem[];

  /**
   * Whether to render children of children in the current panel, specifies the
   * number of items to render. If set to `0`, will never expand.
   */
  expand?: number;

  /**
   * Whether instead of expanding the direct children, expand a specific child
   * by its index.
   */
  expandChild?: number;

  /**
   * How many items to render in the toolbar view before rendering the "see all"
   * item.
   */
  maxToolbarItems?: number;

  /**
   * Whether to show children on section title hover.
   */
  openOnTitleHov?: boolean;

  /** Whether this action is potentially dangerous. */
  danger?: boolean;

  /**
   * Whether to show ellipsis "..." after the display name. Used in case when
   * there is more UI that user will see after clicking on this item.
   */
  more?: boolean;

  /**
   * Minimum width for the context menu.
   */
  minWidth?: number;

  /**
   * Whether the item is "active". This is used to highlight the
   * item in the menu, for example, when the item is some toggle
   * or a button that is currently selected.
   */
  active?: SyncStore<boolean>;

  /**
   * Whether to render the item as disabled.
   */
  disabled?: SyncStore<boolean>;

  /** Callback when the item is clicked. */
  onSelect?: React.EventHandler<React.MouseEvent<Element> | React.TouchEvent<Element>>;
}
