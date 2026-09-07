import {rule} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonBack} from '../../2-inline-block/BasicButton/BasicButtonBack';
import {Button} from '../../2-inline-block/Button';
import {WithShortcut} from '../../2-inline-block/WithShortcut';
import {Flex} from '../../3-list-item/Flex';
import {SetTraces} from '../../context/traces';
import type {ViewProjection} from '../../types/ViewProjection';
import {useAnchorPoint} from '../../utils/popup';
import {BasicTooltip} from '../BasicTooltip';
import {ContextHeader} from '../ContextMenu/ContextHeader';
import {ContextMenuHeading} from '../ContextMenu/ContextMenu/ContextMenuHeading';
import {ContextPane} from '../ContextMenu/ContextPane';
import {ContextPaneFooterSep} from '../ContextMenu/ContextPaneFooterSep';
import {ContextPaneHeaderSep} from '../ContextMenu/ContextPaneHeaderSep';
import {ContextSep} from '../ContextMenu/ContextSep';
import {Scrollbox} from '../Scrollbox';
import type {MenuItem, Param} from '../StructuralMenu/types';
import {AddFieldRow} from './AddFieldRow';
import {ArgBoolReveal} from './components/ArgBoolReveal';
import {ArgColorReveal} from './components/ArgColorReveal';
import {ArgSelectReveal, isMultiple, readMulti} from './components/ArgSelect';
import type {FieldHintProps} from './components/FieldHint';
import {EmptyValue} from './EmptyValue';
import type {FieldActionsPane} from './FieldActions';
import {FieldControl} from './FieldControl';
import {FieldGhostButton} from './FieldGhostButton';
import {FieldRow} from './FieldRow';
import {FieldValueView, isEmptyValue, requiredEmpty} from './FieldValueView';
import {buttonHeightFor} from './metrics';
import {numHint, numInvalid} from './num';
import {resolveProjection} from './projection';
import {FieldsState, isParam} from './state';
import {strHint, strInvalid} from './str';
import {ValueCell} from './ValueCell';
import type {FieldEditMode} from './variants';

const footerClass = rule({
  d: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  pad: '4px 16px',
  gap: '8px',
});

const nameClass = rule({
  fz: '13px',
  pad: '0 0 0 4px',
});

export interface FieldListProps {
  item: MenuItem;
  params: (Param | MenuItem)[];
  minWidth?: number;
  /**
   * Value-cell alignment for every field row. `'right'` (default) is the
   * compact context-menu look; `'left'` is the property-panel look.
   */
  align?: 'left' | 'right';
  /** Vertical rhythm in `[0..1]` for field rows. Precedence: prop > trace > 0.5. */
  spacing?: number;
  /** Information density in `[0..1]` for field rows. Precedence: prop > trace > 0.5. */
  detail?: number;
  projection?: ViewProjection;
  /**
   * Density preset bundling `spacing` + `detail` + `align` (overridden by the
   * individual props).
   */
  variant?: 'menu' | 'block' | 'card';
  edit?: FieldEditMode;
  /** When set, renders a "+ Add field" footer row that fires this callback. */
  onAddField?: () => void;
  /** Label for the add-field footer. Defaults to "Add field". */
  addFieldLabel?: React.ReactNode;
  /**
   * Fires when a view-only (low-detail) value cell is clicked — e.g. to open a
   * fuller editor / block view later. Receives the field id (or name).
   */
  onActivate?: (fieldId: string) => void;
  /**
   * Per-field manage menu. When set, each field's definition cell becomes a
   * clickable button that opens a context menu built from these items (rename,
   * edit type, hide, duplicate, delete, …).
   */
  manage?: (param: Param) => MenuItem[];
  /**
   * Per-field action buttons (comment, copy, etc.) rendered as a `ToolbarMenu` at
   * the end of each row and revealed on hover. Overrides the field descriptor's
   * own `actions`; when omitted each field's `param.actions` is used.
   */
  actions?: (param: Param) => MenuItem[];
  /**
   * Pane around each row's action buttons (the `ToolbarMenu` pane). Defaults to
   * a compact pane; pass `false` for bare buttons or a `ContextPaneProps` object
   * to customize.
   */
  actionsPane?: FieldActionsPane;
  /**
   * Float the per-row actions over the right edge (`position: absolute`) instead
   * of taking layout space, so the value column keeps the full width to the
   * edge and the actions overlay it on hover.
   */
  floatActions?: boolean;
  /**
   * Whether value cells stretch to fill the row width (card/block look) or size
   * to their content (context-menu look). Defaults to stretch for left-aligned
   * lists and no-stretch for right-aligned ones.
   */
  stretch?: boolean;
  /** Paint a light full-row background on hover (Notion-style). Opt-in. */
  rowHover?: boolean;
  /**
   * Auto-focus the first field's control on mount. Defaults to `true` for the
   * `menu` variant (quick context-menu entry) and `false` otherwise.
   */
  autoFocus?: boolean;
  /**
   * Render as inline content with no surrounding `<ContextPane>`, no
   * header (back button + title), no footer separator, and no Escape
   * keydown handler. Returns just the row body so the args list can be
   * embedded inside a host pane that already provides its own chrome.
   */
  inline?: boolean;
  onCancel: () => void;
  /**
   * Fires when the user clicks Apply.
   */
  onSubmit?: (list: [string, unknown][], args: Record<string, unknown>) => void;
  /**
   * Fires on every settled value change real-time.
   */
  onChange?: (list: [string, unknown][], args: Record<string, unknown>) => void;
}

// Subscribe to all reactive `visible` stores on the current params list and
// trigger a re-render of the pane whenever any value flips.
const useVisibilityVersion = (params: FieldListProps['params']): number => {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setV((x) => x + 1);
    const unsubs: Array<() => void> = [];
    for (const p of params) {
      if (p && p.visible) {
        try {
          unsubs.push(p.visible.subscribe(bump));
        } catch {}
      }
    }
    return () => {
      for (const u of unsubs) u();
    };
  }, [params]);
  return v;
};

// Value kinds that collapse to a read-only view in low-detail (card) rows; the
// rest stay interactive even when dense (enum) or are already read-only
// (btn/code/info). External (entity) fields also show a chip + reveal editor.
// Bool/color/select have their own reveal presentations (`ArgBoolReveal`,
// `ArgColorReveal`, `ArgSelectReveal`) handled before the generic value cell.
const VIEW_ONLY_KINDS = new Set<string>(['str', 'num', 'date', 'color', 'select', 'char', 'external']);

// Approx fixed-chrome heights (header row, separators, apply footer).
const HEADER_H = 40;
const SEPARATOR_H = 7;
const FOOTER_H = 56;

export const FieldList: React.FC<FieldListProps> = (props) => {
  const {item, params, onCancel, minWidth} = props;
  const [t] = useT();
  const {variant, edit, spacing, detail, align} = resolveProjection(props.projection, props);
  const btnHeight = buttonHeightFor(spacing);
  const stretch = props.stretch ?? align === 'left';
  const autoFocus = props.autoFocus ?? variant === 'menu';
  const anchor = useAnchorPoint();
  const state = React.useMemo(() => new FieldsState(props), [props]);
  const args = state.args.use();
  useVisibilityVersion(params);
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (let i = 0; i < params.length; i++) {
      const p = params[i];
      if (p.heading && p.collapsible && p.initialCollapsed) {
        const key = p.id ?? p.name ?? `h${i}`;
        init[key] = true;
      }
    }
    return init;
  });
  const toggleCollapsed = (key: string) => setCollapsed((c) => ({...c, [key]: !c[key]}));

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    },
    [onCancel],
  );

  const display = item.display?.() ?? t(item.name);

  const rows: React.ReactNode[] = [];
  let inCollapsed = false;
  let lastRendered: Param | MenuItem | undefined;
  for (let i = 0; i < params.length; i++) {
    const arg = params[i];
    const isHeading = !!arg.heading;
    const isSep = !!arg.sep;
    const isInnerSep = !!arg.innerSep;
    const key = (arg.id ?? arg.name ?? `i${i}`) + (isHeading ? '-h' : isSep ? '-s' : isInnerSep ? '-is' : '');

    if (arg.visible && arg.visible.getSnapshot() === false) continue;

    // Inner separator: a padded, inert horizontal line. Doesn't break the
    // current group's collapse state, and doesn't register as a boundary —
    // it's purely decorative and lives inside a group.
    if (isInnerSep) {
      if (inCollapsed) continue;
      rows.push(
        <div key={key} role="presentation" aria-hidden="true" style={{padding: '3px 16px'}}>
          <div
            style={{
              height: 1,
              background: 'currentColor',
              opacity: 0.07,
            }}
          />
        </div>,
      );
      continue;
    }

    if (isHeading) {
      const groupKey = arg.id ?? arg.name ?? `h${i}`;
      const isCollapsed = !!arg.collapsible && !!collapsed[groupKey];
      const showLine = !!lastRendered;
      const showSpacer = showLine && !lastRendered?.heading && !lastRendered?.sep;
      inCollapsed = isCollapsed;
      rows.push(
        <React.Fragment key={key}>
          {showLine &&
            (item.compact ? (
              <>
                {showSpacer && <div style={{height: 2}} aria-hidden />}
                <ContextSep line />
              </>
            ) : (
              <>
                <ContextSep />
                <ContextSep line />
                <ContextSep />
              </>
            ))}
          <ContextMenuHeading
            item={arg}
            compact={item.compact}
            collapsed={isCollapsed}
            onToggle={arg.collapsible ? () => toggleCollapsed(groupKey) : undefined}
          />
        </React.Fragment>,
      );
      lastRendered = arg;
      continue;
    }

    if (isSep) {
      inCollapsed = false;
      rows.push(
        <React.Fragment key={key}>
          <ContextSep />
          <ContextSep line />
          <ContextSep />
        </React.Fragment>,
      );
      lastRendered = arg;
      continue;
    }

    if (inCollapsed) continue;

    if (isParam(arg)) {
      const id = arg.id ?? arg.name;
      const val = args[id];
      const complex = VIEW_ONLY_KINDS.has(arg.kind);
      let valueCell: React.ReactNode;
      let valueStretch = stretch;
      if (arg.readonly && arg.kind !== 'btn' && arg.kind !== 'code' && arg.kind !== 'info') {
        valueStretch = true;
        valueCell = (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: btnHeight,
              minWidth: 0,
              overflow: 'hidden',
              justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
            }}
          >
            <span style={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {isEmptyValue(arg, val) ? <EmptyValue /> : <FieldValueView param={arg} value={val} />}
            </span>
          </span>
        );
      } else if (edit === 'reveal' && arg.kind === 'bool') {
        valueStretch = true;
        valueCell = (
          <ArgBoolReveal param={arg} value={val as any} onChange={(v) => state.setValue(id, v)} align={align} />
        );
      } else if (edit === 'reveal' && arg.kind === 'color') {
        valueStretch = true;
        valueCell = <ArgColorReveal param={arg} value={val} onChange={(v) => state.setValue(id, v)} align={align} />;
      } else if (edit === 'reveal' && arg.kind === 'select') {
        valueStretch = true;
        valueCell = <ArgSelectReveal param={arg} value={val} onChange={(v) => state.setValue(id, v)} align={align} />;
      } else if ((edit === 'reveal' || (edit !== 'view' && arg.kind === 'str' && arg.multiline)) && complex) {
        valueStretch = true;
        valueCell = (
          <ValueCell
            param={arg}
            value={val}
            onChange={(v) => state.setValue(id, v)}
            onSubmit={state.onSubmit}
            align={align}
            stretch={valueStretch}
          />
        );
      } else if (edit === 'view' && complex) {
        valueStretch = true;
        valueCell = (
          <FieldGhostButton
            onClick={props.onActivate ? () => props.onActivate?.(id) : undefined}
            style={{
              width: '100%',
              height: btnHeight,
              justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
              overflow: 'hidden',
              ...(align === 'right' ? {marginInlineEnd: -6} : {marginInlineStart: -6}),
            }}
          >
            {isEmptyValue(arg, val) ? (
              <EmptyValue required={requiredEmpty(arg, val)} />
            ) : (
              <FieldValueView param={arg} value={val} />
            )}
          </FieldGhostButton>
        );
      } else {
        valueCell = (
          <FieldControl
            param={arg}
            value={val}
            onChange={(v) => state.setValue(id, v)}
            onSubmit={state.onSubmit}
            focus={i === 0 && autoFocus}
            align={align}
          />
        );
      }
      const live = edit !== 'reveal' && edit !== 'view' && !arg.readonly;
      const rules =
        arg.kind === 'str' && live && !arg.multiline
          ? strHint(arg)
          : arg.kind === 'num' && live
            ? numHint(arg)
            : undefined;
      let hint: FieldHintProps | undefined = variant === 'menu' ? undefined : rules;
      if (variant === 'menu' && live) {
        const v = val && typeof val === 'object' && 'value' in (val as object) ? (val as any).value : val;
        if (requiredEmpty(arg, val)) {
          hint = {note: 'Required', warn: true};
        } else if (rules && arg.kind === 'str') {
          if (strInvalid(arg, String(v ?? ''))) hint = {note: rules.note, warn: true};
        } else if (rules && arg.kind === 'num') {
          if (typeof v === 'number' && numInvalid(arg, v)) hint = {note: rules.note, warn: true};
        } else if (arg.kind === 'select' && isMultiple(arg)) {
          const min = arg.min ?? 0;
          if (readMulti(val, arg).length < min) hint = {note: `Select at least ${min}`, warn: true};
        }
      }
      rows.push(
        <FieldRow
          key={key}
          icon={arg.icon?.()}
          title={arg.display?.() ?? t(arg.name ?? arg.id ?? '')}
          optional={arg.optional}
          hint={hint}
          align={align}
          spacing={spacing}
          detail={detail}
          manage={props.manage ? () => props.manage!(arg) : undefined}
          actions={props.actions ? props.actions(arg) : arg.actions}
          actionsPane={props.actionsPane}
          floatActions={props.floatActions}
          stretch={valueStretch}
          rowHover={props.rowHover}
        >
          {valueCell}
        </FieldRow>,
      );
      lastRendered = arg;
    }
  }

  if (props.onAddField) {
    rows.push(
      <AddFieldRow key="__add_field__" onClick={props.onAddField} label={props.addFieldLabel} spacing={spacing} />,
    );
  }

  // Trace the resolved density to the whole list subtree (controls inherit it).
  const body = <SetTraces value={{spacing, detail}}>{rows}</SetTraces>;

  const submitFooter = props.onSubmit ? (
    <>
      {lastRendered?.heading ? <div style={{height: 2}} aria-hidden /> : <ContextSep />}
      <ContextSep line />
      <ContextSep />
      <div className={footerClass} style={item.compact ? {justifyContent: 'center'} : undefined}>
        {item.compact ? (
          <WithShortcut shortcut="Enter">
            <Button size={-2} disabled={!state.canSubmit()} onClick={state.onSubmit}>
              {t('Apply')}
            </Button>
          </WithShortcut>
        ) : (
          <BasicTooltip shortcut="⏎" renderTooltip={() => 'Enter'}>
            <Button disabled={!state.canSubmit()} onClick={state.onSubmit}>
              {t('Apply')}
            </Button>
          </BasicTooltip>
        )}
      </div>
      <ContextSep />
    </>
  ) : null;

  if (props.inline) {
    return (
      <>
        {body}
        {submitFooter}
      </>
    );
  }

  // Cap pane width so long values (e.g. a `kind: 'code'` row showing a long
  // path or LaTeX source) can't push the pane to many thousands of pixels.
  // Compact panes get a sensible default; non-compact panes only cap when
  // `item.maxWidth` is set explicitly. Honors `item.maxWidth` either way.
  const paneMaxWidth = item.maxWidth ?? (item.compact ? 480 : undefined);

  const footerHeight = submitFooter ? FOOTER_H : 0;
  const maxScrollHeight =
    (anchor?.maxHeight() ?? (typeof window !== 'undefined' ? window.innerHeight : 600)) -
    HEADER_H -
    SEPARATOR_H -
    SEPARATOR_H -
    footerHeight;

  return (
    <ContextPane
      style={{
        minWidth: minWidth ?? (item.compact ? 333 : 220),
        ...(paneMaxWidth !== undefined ? {maxWidth: paneMaxWidth} : {}),
      }}
      onKeyDown={handleKeyDown}
    >
      <ContextHeader compact>
        <Flex style={{alignItems: 'center'}}>
          <BasicButtonBack onClick={onCancel} />
          <span className={nameClass}>{display}</span>
        </Flex>
      </ContextHeader>
      <ContextPaneHeaderSep />
      <ContextSep />
      <Scrollbox style={{maxHeight: maxScrollHeight}}>{body}</Scrollbox>
      {!submitFooter && (
        <>
          {lastRendered?.heading ? <div style={{height: 2}} aria-hidden /> : <ContextSep />}
          <ContextPaneFooterSep />
        </>
      )}
      {submitFooter}
    </ContextPane>
  );
};
