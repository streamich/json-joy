import * as React from 'react';
import {bind} from '@jsonjoy.com/collaborative-input';
import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';

/**
 * Imperative handle that a custom input element, rendered through the
 * {@link CollaborativeInputProps.inp} render prop, may expose to
 * `<CollaborativeInput>` via its `ref`.
 */
export interface CollaborativeInputHandle {
  /** The underlying `<input>` or `<textarea>` element to bind the CRDT to. */
  readonly input: HTMLInputElement | HTMLTextAreaElement | null;

  /**
   * Optional callback to re-measure/resize the element. Called once after the
   * initial binding and whenever the bound "str" node changes (i.e. on remote
   * or programmatic edits that don't emit a DOM `input` event).
   */
  resize?: () => void;
}

/** Props passed to the {@link CollaborativeInputProps.inp} render prop. */
export interface CollaborativeInputRenderProps {
  /**
   * Ref which must receive the input element's {@link CollaborativeInputHandle}.
   * Typed loosely so it can be spread onto any element/component whose handle is
   * structurally compatible with {@link CollaborativeInputHandle} (such as
   * `<FlexibleInput>`, whose handle is a superset).
   */
  ref: React.Ref<any>;

  /** Whether the input is multiline. */
  multiline?: boolean;

  /** The value is driven by the CRDT binding, not controlled by React. */
  uncontrolled: true;
}

export interface CollaborativeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** JSON CRDT "str" node API. */
  str: () => CollaborativeStr;

  /**
   * Whether to poll for updates the underlying <input> or <textarea> element
   * in case some third-party code modifies the value of the input element.
   */
  polling?: boolean;

  /** Whether the input is multiline. */
  multiline?: boolean;

  /**
   * Render prop for a custom input element. It receives props that must be
   * spread onto a component which exposes a {@link CollaborativeInputHandle}
   * through its `ref` (such as `<FlexibleInput>`):
   *
   * ```tsx
   * <CollaborativeInput str={str} inp={(props) => <FlexibleInput {...props} />} />
   * ```
   *
   * When omitted, a plain `<input>`/`<textarea>` element is rendered and all
   * other props are forwarded to it.
   */
  inp?: (props: CollaborativeInputRenderProps) => React.ReactElement;
}

export const CollaborativeInput: React.FC<CollaborativeInputProps> = ({inp, str, polling, multiline, ...rest}) => {
  const handleRef = React.useRef<CollaborativeInputHandle | null>(null);
  const domRef = React.useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the binding only depends on the "str" node and polling
  React.useLayoutEffect(() => {
    const input = inp ? (handleRef.current?.input ?? null) : domRef.current;
    if (!input) return;
    const unbind = bind(str, input, !!polling);
    let stop: undefined | (() => void);
    if (handleRef.current?.resize) {
      handleRef.current.resize();
      stop = str().api.onChange.listen(() => handleRef.current?.resize?.());
    }
    return () => {
      unbind();
      stop?.();
    };
  }, [str, polling]);

  if (inp) return inp({ref: handleRef, multiline, uncontrolled: true});

  (rest as any).ref = (el: HTMLInputElement | HTMLTextAreaElement) => {
    domRef.current = el;
  };
  return React.createElement(multiline ? 'textarea' : 'input', rest);
};
