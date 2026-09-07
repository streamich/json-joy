import * as React from 'react';
import {useSpacingTrace} from '../../context/traces';
import {useLockScrolling} from '../../hooks/useLockScrolling';
import {useSingletonPopup} from '../../hooks/useSingletonPopup';
import {useStyles} from '../../styles/context';
import {anchorContext, useAnchorPointHandle} from '../../utils/popup';
import {context as popupCtx} from '../Popup/context';
import {PopupControlled} from '../Popup/PopupControlled';
import type {MenuItem, Param} from '../StructuralMenu/types';
import {EmptyValue} from './EmptyValue';
import {FieldEditor} from './FieldEditor';
import {FieldValueView, isEmptyValue, requiredEmpty} from './FieldValueView';
import {buttonHeightFor, FIELD_POPUP_SCOPE} from './metrics';
import {ValueCellSurface} from './ValueCellSurface';
import {ValuePopover} from './ValuePopover';
import {currentSource, type ValueSource} from './ValueSource';

export interface ValueCellProps {
  param: Param;
  /** Raw value (coerced to a `current` source). */
  value?: unknown;
  /** Richer provenance source; takes precedence over `value`. */
  source?: ValueSource;
  onChange: (value: unknown) => void;
  /** Pane-level submit (Apply), if the host wires one. */
  onSubmit?: () => void;
  /** Persist select option-definition edits (create / reorder / delete). */
  onOptionsChange?: (options: MenuItem[]) => void;
  /**
   * Cell alignment. The value sits at this edge and the popover pins to it.
   * `'left'` is the property-panel look (card/block); `'right'` the menu look.
   */
  align?: 'left' | 'right';
  /**
   * Whether the value fills the cell width (card/block) or sizes to its content
   * (context menu). When stretching, the trigger is full-width (`block`); when
   * not, it hugs its content. @default true
   */
  stretch?: boolean;
  /**
   * Override the reveal popover body (defaults to {@link FieldEditor}).
   * Receives the live value plus commit helpers, so a kind can present a
   * custom editor — e.g. a full color picker — while reusing this cell's
   * trigger, anchoring, width-matching, and dismissal.
   */
  renderPopover?: (ctx: {value: unknown; onChange: (value: unknown) => void; onCommit: () => void}) => React.ReactNode;
  /**
   * Render the `renderPopover` body without the {@link ValuePopover} pane
   * wrapper — for bodies that bring their own chrome (e.g. a `ContextMenu`,
   * which is already a pane). Ignored when `renderPopover` is not set.
   */
  barePopover?: boolean;
}

export const ValueCell: React.FC<ValueCellProps> = (props) => {
  const {
    param,
    value,
    source,
    onChange,
    onSubmit,
    onOptionsChange,
    renderPopover,
    barePopover,
    align = 'left',
    stretch = true,
  } = props;
  const styles = useStyles();
  const spacing = useSpacingTrace(0.5);
  const btnHeight = buttonHeightFor(spacing);

  const src = source ?? currentSource(value);
  const val = src.values[0]?.value;
  const meta = src.values[0]?.meta;
  const editable = src.reason !== 'computed';
  const muted = meta?.reason === 'default';

  const popup = useSingletonPopup(FIELD_POPUP_SCOPE);
  const closePopup = React.useCallback(() => popup.setOpen(false), [popup]);
  const popupContextValue = React.useMemo(() => ({close: closePopup}), [closePopup]);
  const onTriggerMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      popup.setOpen(!popup.open);
    },
    [popup],
  );
  const onTriggerKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        popup.setOpen(!popup.open);
      }
    },
    [popup],
  );
  const anchorHandle = useAnchorPointHandle({pinX: align === 'right' ? 'right' : 'left'});
  useLockScrolling(popup.open);

  // Match the popover width to the value column so it lines up under the cell.
  const [minW, setMinW] = React.useState<number | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (!popup.open) return;
    const w = anchorHandle.toggle?.offsetWidth;
    if (w) setMinW(Math.max(200, Math.min(Math.round(w), 460)));
  }, [popup.open, anchorHandle]);

  const offset: React.CSSProperties = align === 'right' ? {marginInlineEnd: -6} : {marginInlineStart: -6};
  const empty = isEmptyValue(param, val);
  const chipStyle: React.CSSProperties = stretch
    ? {minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}
    : {display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap'};
  const chip = (
    <span style={chipStyle}>
      {empty ? <EmptyValue required={requiredEmpty(param, val)} /> : <FieldValueView param={param} value={val} />}
    </span>
  );

  if (!editable) {
    return (
      <span
        title={meta?.origin}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: btnHeight,
          opacity: 0.8,
          color: styles.g(0.3),
          ...offset,
          paddingInline: 6,
        }}
      >
        <span style={{fontStyle: 'italic', fontSize: 12, opacity: 0.7}} aria-hidden>
          ƒ
        </span>
        {chip}
      </span>
    );
  }

  const trigger = (
    <ValueCellSurface
      align={align}
      stretch={stretch}
      muted={muted}
      onMouseDown={onTriggerMouseDown}
      onKeyDown={onTriggerKeyDown}
      aria-haspopup="dialog"
      aria-expanded={popup.open}
      title={muted ? meta?.origin : undefined}
    >
      {chip}
    </ValueCellSurface>
  );

  return (
    <popupCtx.Provider value={popupContextValue}>
      <anchorContext.Provider value={anchorHandle}>
        <PopupControlled
          block={stretch}
          open={popup.open}
          refToggle={anchorHandle.ref}
          onClickAway={closePopup}
          onEsc={popup.open ? closePopup : undefined}
          renderContext={() => {
            if (renderPopover) {
              const body = renderPopover({value: val, onChange, onCommit: closePopup});
              return barePopover ? (
                <div style={offset}>{body}</div>
              ) : (
                <ValuePopover minWidth={minW} style={offset}>
                  {body}
                </ValuePopover>
              );
            }
            return (
              <ValuePopover minWidth={minW} style={offset}>
                <FieldEditor
                  param={param}
                  value={val}
                  onChange={onChange}
                  onCommit={closePopup}
                  onSubmit={onSubmit}
                  onOptionsChange={onOptionsChange}
                />
              </ValuePopover>
            );
          }}
        >
          {trigger}
        </PopupControlled>
      </anchorContext.Provider>
    </popupCtx.Provider>
  );
};
