import {FocusProvider} from '@jsonjoy.com/click-json/lib/context/focus';
import {type StyleContextValue, context as styles} from '@jsonjoy.com/click-json/lib/context/style';
import {Root} from '@jsonjoy.com/click-json/lib/Root';
import type {Schema, SchemaBase} from '@jsonjoy.com/json-type';
import {Provider as UiStylesProvider, useStyles as useUiStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useTheme} from 'nano-theme';
import * as React from 'react';
import {type ClickableTypeContextValue, context, createExpansionBus} from './context';
import {cssVars} from './css';
import {IsolationBreadcrumbs} from './IsolationBreadcrumbs';
import {getSchemaAt, type IsolationContextValue, isolationContext} from './isolation';
import {TypeNode} from './TypeNode';

export interface ClickableTypeProps extends StyleContextValue {
  /**
   * The JSON Type schema to render. Accepts either a raw `Schema` POJO or a
   * runtime `Type` instance (anything exposing `getSchema()`).
   */
  type: Schema | {getSchema(): Schema};

  /**
   * Number of nesting levels expanded by default; deeper nodes start collapsed
   * (showing only their title + description until clicked). Defaults to fully
   * expanded, or to `1` when {@link StyleContextValue.collapsed} is set — i.e.
   * `<ClickableType collapsed />` shows the root and its first level only.
   */
  expand?: number;

  /**
   * Whether to render collapse/expand triangles. Defaults to `true`. Nodes stay
   * collapsible via their kind chip regardless.
   */
  toggles?: boolean;

  /**
   * JSON Pointer prefix of the provided schema. Used internally when nesting.
   */
  pfx?: string;

  /**
   * Called with the JSON Pointer of the focused schema node (or `null`).
   */
  onFocus?: (pointer: string | null) => void;

  /**
   * JSON Pointer of the node to *isolate* — render the view down to just that
   * node (as a fresh root) with a breadcrumb trail back to the top. Uses the
   * same standard JSON Pointer form as {@link onFocus} (e.g. `/keys/0/value`;
   * the root is `''`). `null` or `''` shows the whole tree.
   *
   * Providing this prop (even as `null`) puts the component in **controlled**
   * mode: it renders exactly this pointer and never tracks isolation itself —
   * use {@link onIsolation} to store the next value. Omit it for the
   * uncontrolled default, where the component holds the isolation state
   * internally (double-click a node, or use its "Isolate" toolbar action).
   */
  isolation?: string | null;

  /**
   * Called with the JSON Pointer to isolate (or `null` to clear) whenever the
   * user isolates a node — by double-clicking it, picking "Isolate" from its
   * toolbar, or clicking an ancestor breadcrumb. Required to drive a
   * {@link isolation}-controlled component; also fires in uncontrolled mode.
   */
  onIsolation?: (pointer: string | null) => void;
}

const toSchema = (type: ClickableTypeProps['type']): Schema =>
  typeof (type as {getSchema?: unknown}).getSchema === 'function'
    ? (type as {getSchema(): Schema}).getSchema()
    : (type as Schema);

/**
 * Ensures a `@jsonjoy.com/ui` styles context exists (the Markdown renderer and
 * all themed colours need it). If one is already provided by an ancestor (e.g.
 * an app's `UiProvider`), it is reused so the surrounding theme wins. Otherwise
 * a default one is added, inheriting light/dark from the nano-theme context —
 * so apps that only set the nano-theme (without a `ui` styles provider) still
 * get correct dark-mode colours.
 */
const EnsureUiStyles: React.FC<{children: React.ReactNode}> = ({children}) => {
  const styles = useUiStyles();
  const nanoTheme = useTheme();
  if (styles) return <>{children}</>;
  return <UiStylesProvider dark={!nanoTheme.isLight}>{children}</UiStylesProvider>;
};

/**
 * The tree root. Publishes every theme colour as a CSS variable on the root
 * element (see {@link cssVars}) so descendant components can read them from
 * static `rule()`s via `var(--ct-*)` instead of injecting colours per render —
 * no extra wrapper element, the vars ride on click-json's existing `Root`. Read
 * here (inside {@link EnsureUiStyles}) so they track the resolved ui theme.
 */
const ThemedRoot: React.FC<{onFocus?: (pointer: string | null) => void; children: React.ReactNode}> = ({
  onFocus,
  children,
}) => {
  const styles = useUiStyles();
  return (
    <Root onFocus={onFocus} style={styles ? (cssVars(styles) as React.CSSProperties) : undefined}>
      {children}
    </Root>
  );
};

/**
 * Renders a JSON Type schema as a clickable, explorable tree.
 */
export const ClickableType: React.FC<ClickableTypeProps> = (props) => {
  const {onFocus, onIsolation} = props;
  const schema = React.useMemo(() => toSchema(props.type), [props.type]);
  const expand = props.expand ?? (props.collapsed ? 1 : Number.POSITIVE_INFINITY);
  const toggles = props.toggles ?? true;
  const render = React.useMemo<ClickableTypeContextValue['render']>(
    () => (childSchema: SchemaBase, pointer: string) => <TypeNode schema={childSchema} pointer={pointer} />,
    [],
  );
  const expansion = React.useMemo(() => createExpansionBus(), []);
  const ctx = React.useMemo<ClickableTypeContextValue>(
    () => ({pfx: props.pfx ?? '', expand, toggles, render, expansion}),
    [props.pfx, expand, toggles, render, expansion],
  );

  // Isolation: controlled when the `isolation` prop is provided (even as `null`),
  // otherwise tracked internally. The pointer is resolved to a schema node here;
  // an unresolvable pointer harmlessly falls back to the full tree.
  const controlled = props.isolation !== undefined;
  const [internal, setInternal] = React.useState<string | null>(null);
  const isolated = controlled ? (props.isolation ?? null) : internal;
  const resolved = React.useMemo(() => (isolated ? getSchemaAt(schema, isolated) : undefined), [schema, isolated]);
  const active = !!isolated && !!resolved;
  const base = active ? isolated! : '';
  const subSchema = active ? resolved! : schema;
  const setIsolated = React.useCallback(
    (pointer: string) => {
      const next = pointer || null;
      if (!controlled) setInternal(next);
      onIsolation?.(next);
    },
    [controlled, onIsolation],
  );
  const isolation = React.useMemo<IsolationContextValue>(() => ({isolate: setIsolated}), [setIsolated]);

  return (
    <EnsureUiStyles>
      <FocusProvider>
        <styles.Provider value={{...props, readonly: props.readonly ?? true}}>
          <context.Provider value={ctx}>
            <isolationContext.Provider value={isolation}>
              <ThemedRoot onFocus={onFocus}>
                {active ? <IsolationBreadcrumbs root={schema} pointer={base} /> : null}
                <TypeNode key={base} schema={subSchema} pointer={base} />
              </ThemedRoot>
            </isolationContext.Provider>
          </context.Provider>
        </styles.Provider>
      </FocusProvider>
    </EnsureUiStyles>
  );
};
