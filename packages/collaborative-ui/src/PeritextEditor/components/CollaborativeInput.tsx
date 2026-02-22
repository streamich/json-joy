import {createElement, useMemo, useLayoutEffect} from 'react';
import {bind} from 'collaborative-input';
import type {CollaborativeStr} from 'collaborative-editor';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';

class CollaborativeInputState implements UiLifeCycles {
  protected _unbind: (() => void) | undefined;

  constructor(public readonly props: CollaborativeInputProps) {}

  protected readonly unbind = () => {
    this._unbind?.();
    this._unbind = void 0;
  };

  public readonly stop = this.unbind;
  public readonly start = () => this.stop;

  public readonly ref = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!el) return this.unbind();
    const {str, polling} = this.props;
    this._unbind = bind(str, el, !!polling);
  };
}

export interface CollaborativeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Ref to the input element. */
  inp?: (el: HTMLInputElement | HTMLTextAreaElement | null) => void;

  /** JSON CRDT "str" node API. */
  str: () => CollaborativeStr;

  /**
   * Whether to poll for updates the underlying <input> or <textarea> element
   * in case some third-party code modifies the value of the input element.
   */
  polling?: boolean;

  /** Whether the input is multiline. */
  multiline?: boolean;

  input?: (inp: (el: HTMLInputElement | HTMLTextAreaElement | null) => void) => React.ReactNode;
}

export const CollaborativeInput: React.FC<CollaborativeInputProps> = (props) => {
  const {str, polling, inp, input, ...rest} = props;
  // biome-ignore lint: hook dependency list manually managed
  const state = useMemo(() => new CollaborativeInputState(props), [str, polling]);
  // biome-ignore lint: hook dependency list manually managed
  useLayoutEffect(state.start, [state]);

  if (input) return input(state.ref);
  (rest as any).ref = state.ref;
  return createElement(rest.multiline ? 'textarea' : 'input', rest);
};
