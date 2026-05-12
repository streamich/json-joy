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

export const ArgsPane: React.FC<ArgsPaneProps> = (props) => {
  const {item, params, onCancel, minWidth} = props;
  const [t] = useT();
  const state = React.useMemo(() => new ArgsState(props), [props]);
  const args = state.args.use();
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
    const key = (arg.id ?? arg.name ?? `i${i}`) + (isHeading ? '-h' : isSep ? '-s' : '');

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

  return (
    <ContextPane
      style={{minWidth: minWidth ?? (item.compact ? 333 : 220)}}
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
      {!props.onSubmit && (
        <>
          {!lastRendered?.heading && <ContextSep />}
          <ContextPaneFooterSep />
        </>
      )}
      {props.onSubmit && (
        <>
          {!lastRendered?.heading && <ContextSep />}
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
      )}
    </ContextPane>
  );
};
