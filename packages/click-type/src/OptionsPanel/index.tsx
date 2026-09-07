import {ClickableJson} from '@jsonjoy.com/click-json/lib/ClickableJson';
import type {SchemaBase, SchemaExample} from '@jsonjoy.com/json-type';
import {rule} from 'nano-theme';
import * as React from 'react';
import {CollapseToggle} from '../CollapseToggle';
import {useExpandAll, usePointer} from '../context';
import {Md} from '../Md';
import {SchemaToolbar} from '../Toolbar';
import {TypeHoverable} from '../TypeHoverable';
import {COMMON_FIELDS, type FieldDesc, KIND_FIELDS} from './fields';

const options = rule({
  d: 'block',
  pd: '1px 0',
  fz: '0.92em',
});

const optionRow = rule({
  d: 'block',
  lh: '1.7',
});

const optionKey = rule({
  d: 'inline-block',
  mrr: '8px',
  col: 'var(--ct-label)',
  '&::after': {content: '":"'},
});

const optionVal = rule({
  d: 'inline-block',
  va: 'top',
});

// Trims the extra line height the inline-block <ClickableJson> would otherwise
// add, so `json`-control rows (default, deprecated, meta…) match the plain text
// rows' height. Negative top/bottom margin reduces the box's line-box contribution.
const optionJson = rule({
  d: 'inline-block',
  va: 'top',
  mr: '-2px 0',
});

const optText = rule({col: 'var(--ct-dim)'});
const optNum = rule({col: 'var(--ct-num)'});
const optEnum = rule({fw: 'bold', col: 'var(--ct-enum)'});
const optBool = rule({col: 'var(--ct-enum)'});

const exampleList = rule({d: 'block', mrl: '14px'});
const example = rule({
  d: 'block',
  pd: '4px 0',
  '&:not(:first-child)': {bdt: '1px dotted var(--ct-divider)'},
});
const exampleTitle = rule({
  d: 'block',
  fw: 'bold',
  cur: 'default',
  us: 'none',
  col: 'var(--ct-strong)',
  // 2px gap between the collapse chevron and the title text.
  '&>span:first-child': {mrr: '2px'},
});
const exampleMeta = rule({d: 'block', fz: '0.95em', col: 'var(--ct-muted)'});
const exampleValue = rule({d: 'block', mrt: '2px'});
const exampleBody = rule({d: 'inline-block', va: 'top'});

const has = (value: unknown): boolean => value !== undefined && value !== null;

const fieldsFor = (schema: SchemaBase): FieldDesc[] => [...COMMON_FIELDS, ...(KIND_FIELDS[schema.kind] ?? [])];

/** Whether a schema node has any scalar/display option (or examples) to show. */
export const hasOptions = (schema: SchemaBase): boolean => {
  const bag = schema as unknown as Record<string, unknown>;
  for (const field of fieldsFor(schema)) if (has(bag[field.key]) && !field.hide?.(bag[field.key])) return true;
  const examples = (schema as {examples?: unknown[]}).examples;
  return !!(examples && examples.length);
};

const FieldValue: React.FC<{desc: FieldDesc; value: unknown}> = ({desc, value}) => {
  switch (desc.control) {
    case 'json':
      return (
        <span className={optionJson}>
          <ClickableJson doc={value} readonly compact collapsed noCollapseToggles />
        </span>
      );
    case 'markdown':
      return <Md src={String(value)} />;
    case 'bool':
      return <span className={optBool}>{value ? 'true' : 'false'}</span>;
    case 'num':
      return <span className={optNum}>{String(value)}</span>;
    case 'enum':
      return <span className={optEnum}>{String(value)}</span>;
    default:
      return <span className={optText}>{String(value)}</span>;
  }
};

const Example: React.FC<{example: SchemaExample; pointer: string}> = ({example: ex, pointer}) => {
  const [open, setOpen] = React.useState(true);
  useExpandAll(pointer, setOpen);
  const collapsible = !!ex.title;
  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };
  const showBody = !collapsible || open;
  return (
    <div className={example}>
      <TypeHoverable
        pointer={pointer}
        toolbar={<SchemaToolbar data={ex.value} name={ex.title || 'example'} noun="value" pointer={pointer} />}
      >
        <span className={exampleBody}>
          {ex.title ? (
            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level
            <div className={exampleTitle} onClick={toggle}>
              <CollapseToggle collapsed={!open} onToggle={() => setOpen((o) => !o)} />
              <Md src={ex.title} />
            </div>
          ) : null}
          {showBody ? (
            <>
              {ex.intro ? (
                <div className={exampleMeta}>
                  <Md src={ex.intro} />
                </div>
              ) : null}
              {ex.description ? (
                <div className={exampleMeta}>
                  <Md src={ex.description} />
                </div>
              ) : null}
              <div className={exampleValue}>
                <ClickableJson doc={ex.value} readonly compact collapsed noCollapseToggles />
              </div>
            </>
          ) : null}
        </span>
      </TypeHoverable>
    </div>
  );
};

export interface OptionsPanelProps {
  schema: SchemaBase;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({schema}) => {
  const nodePointer = usePointer();
  const bag = schema as unknown as Record<string, unknown>;
  const rows: React.ReactNode[] = [];

  for (const desc of fieldsFor(schema)) {
    const value = bag[desc.key];
    if (!has(value) || desc.hide?.(value)) continue;
    rows.push(
      <div key={desc.key} className={optionRow}>
        <span className={optionKey}>{desc.label}</span>
        <span className={optionVal}>
          <FieldValue desc={desc} value={value} />
        </span>
      </div>,
    );
  }

  const examples = (schema as {examples?: SchemaExample[]}).examples;
  if (examples && examples.length) {
    rows.push(
      <div key="examples" className={optionRow}>
        <span className={optionKey}>examples</span>
        <div className={exampleList}>
          {examples.map((ex, i) => (
            <Example key={i} example={ex} pointer={`${nodePointer}/examples/${i}`} />
          ))}
        </div>
      </div>,
    );
  }

  if (!rows.length) return null;
  return <div className={options}>{rows}</div>;
};
