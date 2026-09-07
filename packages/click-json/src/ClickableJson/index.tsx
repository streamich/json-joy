import * as React from 'react';
import {FocusProvider} from '../context/focus';
import {type StyleContextValue, context as styles} from '../context/style';
import {Root} from '../Root';
import {createEditBus, createExpansionBus, context as json} from './context';
import {IsolationBreadcrumbs} from './IsolationBreadcrumbs';
import {getValueAt, type IsolationContextValue, isolationContext} from './isolation';
import {JsonDoc} from './JsonDoc';
import {JsonHoverable} from './JsonHoverable';
import type {OnChange} from './types';

export interface ClickableJsonProps extends StyleContextValue {
  /**
   * The JSON to display. Can be any JSON value.
   */
  doc: unknown;

  /**
   * Prefix specified by the parent JSON. Used internally.
   */
  pfx?: string;

  /**
   * Callback called when the JSON is changed. The callback receives a [JSON Patch
   * (RFC 6902)](https://datatracker.ietf.org/doc/html/rfc6902) as an argument.
   */
  onChange?: OnChange;

  /**
   * Callback called when the JSON is clicked, returns the clicked JSON pointer.
   */
  onFocus?: (pointer: string | null) => void;

  /**
   * Opt into **uncontrolled** isolation: the component tracks the isolated node
   * in its own internal state, enabling double-click-to-isolate and the "Isolate"
   * toolbar action. Isolation is off entirely unless this is set or the controlled
   * {@link isolation} prop is provided. Ignored when {@link isolation} is given
   * (controlled mode wins); {@link onIsolation} still fires if provided.
   */
  isolatable?: boolean;

  /**
   * JSON Pointer of the node to *isolate* — render the view down to just that
   * node (as a fresh root) with a breadcrumb trail back to the document root.
   * Uses the same standard JSON Pointer form as {@link onFocus} (e.g. `/foo/0`;
   * the root is `''`). `null` or `''` shows the whole document.
   *
   * Providing this prop (even as `null`) puts the component in **controlled**
   * mode: it renders exactly this pointer and never tracks isolation itself —
   * use {@link onIsolation} to store the next value. For uncontrolled isolation
   * with internally-held state, set {@link isolatable} instead.
   */
  isolation?: string | null;

  /**
   * Called with the JSON Pointer to isolate (or `null` to clear) whenever the
   * user isolates a node — by double-clicking it, picking "Isolate" from its
   * toolbar, or clicking an ancestor breadcrumb. Required to drive an
   * {@link isolation}-controlled component; also fires in uncontrolled mode.
   */
  onIsolation?: (pointer: string | null) => void;
}

export const ClickableJson: React.FC<ClickableJsonProps> = (props) => {
  const {onFocus, onIsolation} = props;
  const onChange = props.readonly ? undefined : props.onChange;
  const edit = React.useMemo(() => createEditBus(), []);
  const expansion = React.useMemo(() => createExpansionBus(), []);

  // Isolation is opt-in: controlled when the `isolation` prop is provided (even as
  // `null`), uncontrolled (internal state) when `isolatable` is set, and disabled
  // otherwise. The pointer is resolved against the document here; an unresolvable
  // pointer harmlessly falls back to the full document.
  const controlled = props.isolation !== undefined;
  const enabled = controlled || !!props.isolatable;
  const [internal, setInternal] = React.useState<string | null>(null);
  const isolated = enabled ? (controlled ? (props.isolation ?? null) : internal) : null;
  const resolved = React.useMemo(() => (isolated ? getValueAt(props.doc, isolated) : undefined), [props.doc, isolated]);
  const active = !!isolated && !!resolved?.found;
  const base = active ? isolated! : '';
  const subDoc = active ? resolved!.value : props.doc;
  const setIsolated = React.useCallback(
    (pointer: string) => {
      const next = pointer || null;
      if (!controlled) setInternal(next);
      onIsolation?.(next);
    },
    [controlled, onIsolation],
  );
  const isolation = React.useMemo<IsolationContextValue>(
    () => ({isolate: enabled ? setIsolated : undefined, isolated: active ? base : null}),
    [enabled, setIsolated, active, base],
  );

  return (
    <FocusProvider>
      <styles.Provider value={props}>
        <json.Provider value={{pfx: props.pfx ?? '', onChange, edit, expansion}}>
          <isolationContext.Provider value={isolation}>
            <Root onFocus={onFocus}>
              {active ? <IsolationBreadcrumbs root={props.doc} pointer={base} /> : null}
              <JsonHoverable key={base} pointer={base} value={subDoc}>
                <JsonDoc {...props} doc={subDoc} pointer={base} onChange={onChange} />
              </JsonHoverable>
            </Root>
          </isolationContext.Provider>
        </json.Provider>
      </styles.Provider>
    </FocusProvider>
  );
};
