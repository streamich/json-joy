import type {KeySchema} from '@jsonjoy.com/json-type';
import {rule} from 'nano-theme';
import * as React from 'react';
import {CollapseToggle} from './CollapseToggle';
import {depthContext, hideToggleContext, useDepth, useExpandAll, useType} from './context';
import {keyName, optional, rowBox} from './css';
import {useIsolation} from './isolation';
import {hasOptions, OptionsPanel} from './OptionsPanel';
import {SchemaToolbar} from './Toolbar';
import {TypeHoverable} from './TypeHoverable';

const keyLine = rule({
  d: 'block',
  lh: '1.7',
});

/**
 * Container for an expanded key — draws a single connector line down the gutter
 * (under the key's triangle) spanning the whole key: the `name : value` line
 * (and the value's own expansion) plus the metadata below.
 */
const keyBoxOpen = rule({
  d: 'inline-block',
  va: 'top',
  pos: 'relative',
  '&::before': {
    content: '""',
    pos: 'absolute',
    l: '-7px',
    t: '23px',
    b: '3px',
    bdl: '1px dotted var(--ct-line)',
  },
});

const keyMeta = rule({
  d: 'block',
});

/**
 * Outer wrapper for a key row. Like {@link childIndent} (4px nudge), but also
 * strips the top/bottom padding off the key's own hoverable (its direct child
 * `FocusRegion` span) so the key box hugs its nested value box instead of being
 * taller by the region's padding.
 */
const keyOuter = rule({
  d: 'block',
  pdl: '4px',
  '&>span': {
    pdt: '0',
    pdb: '0',
  },
});

const valueCell = rule({
  d: 'inline-block',
  va: 'top',
  mrt: '-3px',
});

const colon = rule({
  d: 'inline-block',
  mr: '0 6px 0 2px',
  va: 'top',
  col: 'var(--ct-label)',
});

export interface KeyRowProps {
  schema: KeySchema;
  pointer: string;
  /** Extra marker rendered after the key name (e.g. "(private)" for module aliases). */
  suffix?: React.ReactNode;
}

/**
 * One object field / module alias — both render identically, like a nested type:
 * a triangle + `name : <value>` on the line, the value being its own
 * independently-collapsible nested node (always expandable). The key's own
 * metadata renders under a connector line when expanded (toggled by the triangle
 * or the key name).
 */
export const KeyRow: React.FC<KeyRowProps> = ({schema, pointer, suffix}) => {
  const {render, expand, toggles, expansion} = useType();
  const {isolate} = useIsolation();
  const depth = useDepth();
  const hasMeta = hasOptions(schema);
  const [open, setOpen] = React.useState(() => hasMeta && depth < expand);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);
  useExpandAll(
    pointer,
    React.useCallback((o: boolean) => hasMeta && setOpen(o), [hasMeta]),
  );
  const onNameClick = hasMeta
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        toggle();
      }
    : undefined;
  const onBoxClick =
    hasMeta && !open
      ? (e: React.MouseEvent) => {
          e.stopPropagation();
          setOpen(true);
        }
      : undefined;

  return (
    <span className={keyOuter}>
      <TypeHoverable
        pointer={pointer}
        toolbar={
          <SchemaToolbar
            data={schema}
            name={schema.key}
            pointer={pointer}
            onExpandAll={() => expansion.emit(pointer, true)}
            onCollapseAll={() => expansion.emit(pointer, false)}
            onIsolate={() => isolate(pointer)}
          />
        }
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level */}
        <span className={open ? keyBoxOpen : rowBox} onClick={onBoxClick}>
          <span className={keyLine}>
            {hasMeta && toggles ? <CollapseToggle collapsed={!open} onToggle={toggle} /> : null}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level */}
            <span className={keyName} onClick={onNameClick}>
              {schema.key}
            </span>
            {schema.optional ? <span className={optional}>?</span> : null}
            {suffix}
            <span className={colon}>:</span>
            <span className={valueCell}>
              <depthContext.Provider value={depth + 1}>
                <hideToggleContext.Provider value={true}>
                  {render(schema.value, `${pointer}/value`)}
                </hideToggleContext.Provider>
              </depthContext.Provider>
            </span>
          </span>
          {open ? (
            <span className={keyMeta}>
              <OptionsPanel schema={schema} />
            </span>
          ) : null}
        </span>
      </TypeHoverable>
    </span>
  );
};
