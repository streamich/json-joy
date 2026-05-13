import * as React from 'react';
import {useT} from 'use-t';
import {rule} from 'nano-theme';
import {ContextPane} from '../ContextPane';
import {ContextHeader} from '../ContextHeader';
import {ContextSep} from '../ContextSep';
import {ContextPaneHeaderSep} from '../ContextPaneHeaderSep';
import {ContextPaneFooterSep} from '../ContextPaneFooterSep';
import {BasicButtonBack} from '../../../2-inline-block/BasicButton/BasicButtonBack';
import {Flex} from '../../../3-list-item/Flex';
import {Arg} from './Arg';
import {ArgsState, isParam} from './state';
import {ContextMenuHeading} from '../ContextMenu/ContextMenuHeading';
import {Button} from '../../../2-inline-block/Button';
import {BasicTooltip} from '../../BasicTooltip';
import {WithShortcut} from '../../../2-inline-block/WithShortcut';
import type {MenuItem, Param} from '../../StructuralMenu/types';

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

export interface ArgsPaneProps {
  item: MenuItem;
  params: (Param | MenuItem)[];
  minWidth?: number;
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
const useVisibilityVersion = (params: ArgsPaneProps['params']): number => {
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

export const ArgsPane: React.FC<ArgsPaneProps> = (props) => {
  const {item, params, onCancel, minWidth} = props;
  const [t] = useT();
  const state = React.useMemo(() => new ArgsState(props), [props]);
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
  const toggleCollapsed = (key: string) =>
    setCollapsed((c) => ({...c, [key]: !c[key]}));

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
    const key =
      (arg.id ?? arg.name ?? `i${i}`) +
      (isHeading ? '-h' : isSep ? '-s' : isInnerSep ? '-is' : '');

    if (arg.visible && arg.visible.getSnapshot() === false) continue;

    // Inner separator: a padded, inert horizontal line. Doesn't break the
    // current group's collapse state, and doesn't register as a boundary —
    // it's purely decorative and lives inside a group.
    if (isInnerSep) {
      if (inCollapsed) continue;
      rows.push(
        <div
          key={key}
          role="presentation"
          aria-hidden="true"
          style={{padding: '3px 16px'}}
        >
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
      rows.push(
        <React.Fragment key={key}>
          <Arg
            param={arg}
            value={args[arg.id ?? arg.name]}
            compact={item.compact}
            onChange={(v) => state.setValue(arg.id ?? arg.name, v)}
            onSubmit={state.onSubmit}
            focus={i === 0}
          />
        </React.Fragment>,
      );
      lastRendered = arg;
    }
  }

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
        {rows}
        {submitFooter}
      </>
    );
  }

  // Cap pane width so long values (e.g. a `kind: 'code'` row showing a long
  // path or LaTeX source) can't push the pane to many thousands of pixels.
  // Compact panes get a sensible default; non-compact panes only cap when
  // `item.maxWidth` is set explicitly. Honors `item.maxWidth` either way.
  const paneMaxWidth = item.maxWidth ?? (item.compact ? 480 : undefined);

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
      {rows}
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
