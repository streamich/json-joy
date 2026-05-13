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

  /** Render raw content of the item. If specified the item will not be
   * wrapped in <ContextItem> and children wil not be rendered. */
  raw?: () => React.ReactNode;

  /**
   * When set, the parent renderer (toolbar popup, context menu) treats this
   * item as a self-contained panel and renders `pane()` as the ENTIRE popup
   * body — no surrounding `<ContextPane>`, header, separators, or width
   * constraint. The renderer must keep providing a popup context (so the
   * pane can call `usePopup().close()`) but otherwise step out of the way.
   *
   * Use when the popup body is a fully-styled custom pane (e.g. an editor
   * settings form) that already manages its own chrome, scrolling, and
   * dimensions.
   *
   * Mutually exclusive with `children` and `raw` for the popup body's purpose.
   */
  pane?: () => React.ReactNode;

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

  /**
   * Inert visual divider. Unlike `sep`, an `innerSep` is purely
   * decorative: it does not break group collapse boundaries, doesn't
   * register as the "last rendered" boundary item, and has no semantic
   * role. Use it to subtly divide rows inside the same group.
   */
  innerSep?: boolean;

  /**
   * Render as a non-interactive subheading row (like `sep`, but a small
   * label). The `name` (or `display`) provides the label text. The row is
   * not focusable and emits no events.
   */
  heading?: boolean;

  /**
   * For `heading` items: when `true`, the heading is clickable and collapses
   * its group (all rows that follow until the next heading or `sep`). State
   * is tracked by the renderer.
   */
  collapsible?: boolean;

  /**
   * For `collapsible` headings: initial collapsed state. Defaults to `false`
   * (expanded). After mount the user fully controls the state.
   */
  initialCollapsed?: boolean;

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

  /**
   * Tiebreaker priority for search ranking. When two items match the query
   * with the same score, the higher `priority` ranks higher. Has no effect
   * when scores differ — it cannot promote a worse match over a better one.
   * Default `0`.
   */
  priority?: number;

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

  /**
   * Interactive trailing widget — same slot as `right`, but semantically
   * marks the row as a "control row". Used for inline editors that live on
   * the row itself: `<Checkbox>`, `<InputNumber>`, color picker, etc.
   */
  control?: () => React.ReactNode;

  /**
   * Keep the popup open after `onSelect` fires. Default `false` — selecting
   * an item closes the menu. Set to `true` for in-place toggles and other
   * actions that should not dismiss the menu.
   */
  keepOpen?: boolean;

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
   * Hard cap on the context menu width. Useful for items whose body has a
   * naturally wide intrinsic min-content (long URLs, code snippets, etc.)
   * to prevent the popup from stretching past the viewport.
   */
  maxWidth?: number;

  /**
   * Pane-level density flag. When this item opens its own pane (e.g. an
   * args pane via `params`), render that pane in a compact single-row form
   * where each child uses an inline `<MenuItem control>`-style layout. Arg
   * renderers that have a compact variant honor this; others fall back to
   * their default block layout.
   */
  compact?: boolean;

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

  /**
   * Whether to render the item at all. When the store yields `false`, the
   * renderer skips the row entirely (no DOM output, no separator, no slot in
   * keyboard navigation). Defaults to `true` (visible) when omitted.
   */
  visible?: SyncStore<boolean>;

  /** Callback when the item is clicked. */
  onSelect?: React.EventHandler<React.MouseEvent<Element> | React.TouchEvent<Element>>;

  /**
   * Callback fired on `mousedown` of the item, before any click/select runs.
   */
  onMouseDown?: React.MouseEventHandler<Element>;

  /**
   * Argument definitions for this command. When present, selecting the item
   * opens an argument configuration pane instead of executing immediately.
   *
   * Entries are typically `Param` (typed input) but can also be plain
   * `MenuItem` shapes with `heading: true` (section label) or `sep: true`
   * (thin divider) to group the inputs visually.
   */
  params?: (Param | MenuItem)[];

  /**
   * Called when the user confirms argument values. Receives a list of
   * `[idOrName, value]` tuples representing the collected argument values.
   */
  onSubmit?: (list: [idOrName: string, value: unknown][], map: Record<string, unknown>) => void;

  /**
   * Called on every settled argument-value change.
   */
  onChange?: (list: [idOrName: string, value: unknown][], map: Record<string, unknown>) => void;

  /**
   * When `true` *and* `params` is set, the args pane opens as a side popup
   * (like a sub-menu) instead of replacing the current panel content. Hover
   * or click on the row opens it; click-away or escape closes it. Use with
   * `onChange` for a real-time preview UX.
   */
  popupArgs?: boolean;
}

// -------------------------------------- Parameters for argument configuration

export type ParamKind =
  | 'str'
  | 'num'
  | 'bool'
  | 'color'
  | 'select'
  | 'enum'
  | 'char'
  | 'btn'
  | 'code'
  | 'info';

export type Param =
  | ParamStr
  | ParamNum
  | ParamBool
  | ParamColor
  | ParamSelect
  | ParamEnum
  | ParamChar
  | ParamBtn
  | ParamCode
  | ParamInfo;

export interface ParamBase<K extends ParamKind = ParamKind, V = string | number | boolean> extends MenuItem {
  kind: K;
  optional?: boolean;
  default?: V;
  /**
   * When `true`, the arg can be left in "auto" mode (using an inherited or
   * document-level default) instead of an explicit value. UI shows the
   * default greyed out with a click target to override, and a small revert
   * button while overridden to return to auto. A `value` of `undefined`
   * represents auto mode.
   */
  defaultable?: boolean;

  /**
   * Initial `def` state for `defaultable` params. Defaults to `true` (auto
   * mode). Set to `false` to start the arg with the user-override slot
   * active using `initialValue` (or `default` if not provided).
   */
  initialDef?: boolean;

  /**
   * Initial user-override value for `defaultable` params (only meaningful
   * when the param starts in `def: false` state, or to preload the value
   * that will appear when the user first switches off auto). Defaults to
   * `default`.
   */
  initialValue?: V;
}

export interface ParamStr extends ParamBase<'str', string> {
  placeholder?: string;
  /**
   * Fires when the user presses Enter inside the input. Independent of the
   * pane-level `onSubmit` (which is reserved for the "Apply" button and
   * enables canSubmit checks).
   */
  onSubmit?: () => void;
}

export interface ParamNum extends ParamBase<'num', number> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /**
   * Round committed values to this many decimal places. Defaults to the
   * number of decimals implied by `step`. Set explicitly to suppress
   * floating-point artifacts like `1.9000000000000001` from drag scrubs.
   */
  decimals?: number;
  /** Units of value change per pixel of drag scrub. */
  dragSensitivity?: number;
  /** Drag axis. Default `'x'`. Use `'y'` for vertical scrub. */
  dragAxis?: 'x' | 'y' | 'both';
}

export interface ParamBool extends ParamBase<'bool', boolean> {}

export interface ParamColor extends ParamBase<'color', string> {
  placeholder?: string;
  /**
   * Allow transparent (alpha) values.
   */
  alpha?: boolean;
}

export interface ParamSelect extends ParamBase<'select', string> {
  options: MenuItem[];
  /**
   * Placeholder text for the search input inside the dropdown. Defaults to
   * "Find...". Set to provide a more specific hint, e.g. "Find font...".
   */
  searchPlaceholder?: string;
  /**
   * Whether to show the search input in the dropdown popup. When omitted,
   * search is shown automatically for lists with 6 or more options and
   * hidden for shorter lists.
   */
  showSearch?: boolean;
}

/**
 * Small-cardinality multi-choice arg. Rendered as a horizontal toolbar of
 * icon buttons next to the label, one button per option. Use when the choice
 * set is fixed and small (e.g. text alignment: left/center/right/justify).
 */
export interface ParamEnum extends ParamBase<'enum', string> {
  options: MenuItem[];
}

/**
 * Action button arg — not a value, an imperative action. Renders a small
 * `<BasicButton>` on the row's right side that fires `onClick` when pressed.
 */
export interface ParamBtn extends ParamBase<'btn', never> {
  /** Button label. Defaults to `name`. */
  buttonLabel?: string;
  /** Optional icon rendered inside the button, to the left of the label. */
  buttonIcon?: () => React.ReactNode;
  /** Fires when the user clicks the button. */
  onClick?: () => void;
  /** Treat the button as a destructive action (red accent). */
  danger?: boolean;
  /** When `true`, clicking the button opens a confirmation popup. */
  confirm?: boolean;
  /** Confirmation popup title. Defaults to "Are you sure?". */
  confirmLabel?: string;
  /** Confirmation button label inside the prompt. Defaults to the button label. */
  confirmActionLabel?: string;
}

/**
 * Read-only display of a code / identifier value with a copy-to-clipboard
 * button on the right. No value in the args map - purely informational.
 */
export interface ParamCode extends ParamBase<'code', never> {
  /** The text to display and copy. */
  value: string;
  /** Truncate long values with ellipsis. */
  truncate?: boolean;
}

/**
 * Read-only info display row — shows a value formatted per `variant`.
 * No value in the args map - purely informational.
 */
export interface ParamInfo extends ParamBase<'info', never> {
  /** How to format `value`. Defaults to `'text'`. */
  variant?: 'text' | 'date' | 'bytes';
  /** The value to display. */
  value?: string | number | Date;
  /** Render arbitrary content instead of `value`. */
  render?: () => React.ReactNode;
}

/**
 * Single-character (or two-character) arg. Like `str` but the input only retains
 * one or two chars. Use for picking emoji, or initials.
 */
export interface ParamChar extends ParamBase<'char', string> {
  placeholder?: string;

  /**
   * Show an emoji picker as the input. Three modes (mirrors `InputChar`):
   *
   * - `false` / unset: plain single-character text input only.
   * - `true`: small text input AND emoji-picker button side by side.
   * - `'only'`: emoji-picker button only.
   */
  emoji?: boolean | 'only';

  /** How many Unicode code-points the input should retain. */
  length?: number;
}
