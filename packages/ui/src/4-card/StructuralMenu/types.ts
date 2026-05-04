import * as React from 'react';
import type {SyncStore} from '../../types';

// ------------------------------------------------------------- Menu item tree

export interface MenuItem {
  /**
   * Unique identifier of the item. Unique with the parent panel.
   *
   * @default name
   */
  id?: string;

  /** Name of the item. */
  name: string;

  /**
   * Render this item as a "split button": the main face fires `onSelect`,
   * while a separate chevron button on the right opens the children popup.
   * When a string is provided it serves as the chevron button's label.
   */
  split?: boolean | string;

  /**
   * Rich text used to display the item.
   *
   * @default name
   */
  display?: () => React.ReactNode;

  /**
   * If true, wrap the display in a `<code>` element and use monospace font.
   * Used when the item represents some code or a literal value.
   *
   * This can also be achieved by using the `display` property:
   *
   * ```ts
   * {
   *   display: () => <code>{name}</code>,
   * }
   * ```
   */
  mono?: boolean;

  /** Optional description of the command for UI display. */
  description?: string;

  /** Whether this item is a separator. */
  sep?: boolean;

  /** Whether to add a separator before this item. */
  sepBefore?: boolean;

  /** Order of the item within its parent. */
  order?: number;

  /** Extra small description or UI element, displayed next to the name. */
  note?: () => React.ReactNode;

  /**
   * Optional rich content rendered inside the tooltip below the
   * name/description, separated by an edge-to-edge horizontal rule.
   */
  card?: () => React.ReactNode;

  /** Text by which to search for this item, defaults to `name`. */
  text?: string;

  /** Color of the item. If not provided, computed from `id`.  */
  color?: string;

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

  /** Subset of children to show in the toolbar preview before expanding the item. */
  preview?: MenuItem[];

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
   * When `true`, popup-style submenus opened from this item (e.g. toolbar
   * menu popups) suppress their title header. Useful for compact toolbar
   * buttons whose dropdown should look like a plain option list rather than
   * a titled panel.
   */
  noHeader?: boolean;

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

  /**
   * Callback fired on `mousedown` of the item, before any click/select runs.
   */
  onMouseDown?: React.MouseEventHandler<Element>;

  /**
   * Argument definitions for this command. When present, selecting the item
   * opens an argument configuration pane instead of executing immediately.
   */
  params?: Param[];

  /**
   * Called when the user confirms argument values. Receives a list of
   * `[idOrName, value]` tuples representing the collected argument values.
   */
  onSubmit?: (list: [idOrName: string, value: unknown][], map: Record<string, unknown>) => void;
}

// -------------------------------------- Parameters for argument configuration

export type ParamKind = 'str' | 'num' | 'bool' | 'color' | 'select';

export type Param = ParamStr | ParamNum | ParamBool | ParamColor | ParamSelect;

export interface ParamBase<K extends ParamKind = ParamKind, V = string | number | boolean> extends MenuItem {
  kind: K;
  optional?: boolean;
  default?: V;
}

export interface ParamStr extends ParamBase<'str', string> {
  placeholder?: string;
}

export interface ParamNum extends ParamBase<'num', number> {
  placeholder?: string;
}

export interface ParamBool extends ParamBase<'bool', boolean> {}

export interface ParamColor extends ParamBase<'color', string> {
  placeholder?: string;
}

export interface ParamSelect extends ParamBase<'select', string> {
  options: MenuItem[];
}
