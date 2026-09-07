import type {SchemaBase} from '@jsonjoy.com/json-type';
import {rule} from 'nano-theme';
import * as React from 'react';
import {ChildrenSection} from './ChildrenSection';
import {CollapseToggle} from './CollapseToggle';
import {depthContext, hideToggleContext, useDepth, useExpandAll, useHideToggle, usePointer, useType} from './context';
import {KindLabel} from './KindLabel';
import {Md} from './Md';
import {hasOptions, OptionsPanel} from './OptionsPanel';
import {getTrailer} from './trailer';

const typeCls = rule({
  d: 'inline-block',
  ff: 'monospace',
  va: 'top',
  col: 'var(--ct-text)',
});

const headerCls = rule({
  d: 'inline-block',
  lh: '1.7',
});

const titleCls = rule({
  fw: 'bold',
  col: 'var(--ct-strong)',
});

const trailerCls = rule({
  mrl: '8px',
  fz: '0.9em',
  col: 'var(--ct-muted)',
});

const descLineCls = rule({
  d: 'block',
  fz: '0.92em',
  lh: '1.5',
  col: 'var(--ct-desc)',
});

export interface TypeLayoutProps {
  schema: SchemaBase;
  children?: React.ReactNode;
  /** Label for the children section (e.g. "keys", "variants"). */
  childrenLabel?: React.ReactNode;
  /** Custom collapsed-trailer; falls back to {@link getTrailer}. */
  trailer?: React.ReactNode;
  /** Preview shown beside the children-section label while that section is collapsed. */
  childrenPreview?: React.ReactNode;
}

/**
 * Shared frame for every schema node, with two universal states:
 *
 * - **Collapsed** (compact): two lines — `[kind] title  <trailer>` then the
 *   plain description. A glance shows what the type is and what it's for.
 * - **Expanded**: the full {@link OptionsPanel} plus, for composites, an
 *   independently-collapsible {@link ChildrenSection}.
 *
 * Toggling: click the kind chip to collapse/expand; when collapsed, clicking
 * anywhere on the node expands it. The left-gutter triangle is just an extra
 * affordance — hidden globally via `toggles` or, for a key's immediate value,
 * via {@link hideToggleContext}.
 */
export const TypeLayout: React.FC<TypeLayoutProps> = ({
  schema,
  children,
  childrenLabel,
  trailer: customTrailer,
  childrenPreview,
}) => {
  const depth = useDepth();
  const {expand, toggles} = useType();
  const hideToggle = useHideToggle();
  const hasChildren = children !== undefined && children !== null && children !== false;
  const collapsible = hasChildren || hasOptions(schema);
  const [collapsed, setCollapsed] = React.useState(() => collapsible && depth >= expand);
  const toggle = React.useCallback(() => setCollapsed((c) => !c), []);
  useExpandAll(
    usePointer(),
    React.useCallback((open: boolean) => setCollapsed(!open), []),
  );
  const trailer = customTrailer ?? getTrailer(schema);

  const showTriangle = collapsible && toggles && !hideToggle;
  const onChipClick = collapsible
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        toggle();
      }
    : undefined;
  const onNodeClick =
    collapsible && collapsed
      ? (e: React.MouseEvent) => {
          e.stopPropagation();
          setCollapsed(false);
        }
      : undefined;

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handling is managed at the FocusProvider level
    <span className={typeCls} onClick={onNodeClick}>
      <span className={headerCls}>
        {showTriangle ? <CollapseToggle collapsed={collapsed} onToggle={toggle} /> : null}
        <KindLabel kind={schema.kind} onClick={onChipClick} />
        {schema.title ? (
          <span className={titleCls}>
            <Md src={schema.title} />
          </span>
        ) : null}
        {(collapsed || !collapsible) && trailer ? <span className={trailerCls}>{trailer}</span> : null}
      </span>
      {collapsed ? (
        schema.description ? (
          <span className={descLineCls}>
            <Md src={schema.description} />
          </span>
        ) : null
      ) : (
        <>
          <OptionsPanel schema={schema} />
          {hasChildren ? (
            <depthContext.Provider value={depth + 1}>
              <hideToggleContext.Provider value={false}>
                <ChildrenSection label={childrenLabel} collapsedPreview={childrenPreview}>
                  {children}
                </ChildrenSection>
              </hideToggleContext.Provider>
            </depthContext.Provider>
          ) : null}
        </>
      )}
    </span>
  );
};
