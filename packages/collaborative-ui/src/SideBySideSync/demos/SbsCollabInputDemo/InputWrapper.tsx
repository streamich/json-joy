import * as React from 'react';
import {bind} from '@jsonjoy.com/collaborative-input';
import {Model, s, StrApi} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '@jsonjoy.com/collaborative-input-react';
import {Markdown} from '@jsonjoy.com/ui/lib/markdown/Markdown';
import {Input} from '@jsonjoy.com/ui/lib/2-inline-block/Input';
import {SideBySideSync} from '../..';
import {DemoCard} from '../../../DemoCard';
import {DESCRIPTION} from './constants';
import {CollaborativeStr} from '@jsonjoy.com/collaborative-str';

export interface UiLifeCycles {
    /**
     * Called when UI component is mounted. Returns a function to be called when
     * the component is removed from the screen.
     */
    start(): () => void;
}

class State implements UiLifeCycles {
  protected _el: HTMLInputElement | HTMLTextAreaElement | null = null;
  protected _unbind: (() => void) | undefined;

  constructor(
    public readonly str: () => CollaborativeStr,
    public readonly polling: boolean = false,
  ) {}

  protected readonly unbind = () => {
    this._unbind?.();
    this._unbind = void 0;
  };

  public readonly stop = this.unbind;
  public readonly start = () => this.stop;

  public readonly ref = (el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (!el) return this.unbind();
    if (el === this._el) return;
    this._el = el;
    console.log('binding', el);
    const {str, polling} = this;
    this._unbind = bind(str, el, !!polling);
  };
}

interface InputWrapperProps {
  /** JSON CRDT "str" node API. */
  str: () => StrApi;
  // str: () => CollaborativeStr;

  /**
   * Whether to poll for updates the underlying <input> or <textarea> element
   * in case some third-party code modifies the value of the input element.
   */
  polling?: boolean;

  input: (
    ref: (el: HTMLElement | null) => void,
    value: string,
    onChange: (value: string | React.ChangeEvent<HTMLInputElement>) => void,
  ) => React.ReactNode;
}

export const InputWrapper: React.FC<InputWrapperProps> = ({str, polling, input}) => {
  // biome-ignore lint: hook dependency list manually managed
  const state = React.useMemo(() => new State(str, polling), [str, polling]);
  // biome-ignore lint: hook dependency list manually managed
  React.useLayoutEffect(state.start, [state]);

  const s = str();
  // const events = s.events;
  // const value = React.useSyncExternalStore(events.subscribe, events.getSnapshot);
  const ref = React.useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const input = el.querySelector('input');
    if (!input) return;
    console.log('reffing', input);
    state.ref(input);
  }, [s, state]);

  const onChange = React.useCallback((value: string | React.ChangeEvent<HTMLInputElement>) => {
    const str = typeof value === 'string' ? value : value.target.value;
    console.log('onChange', str);
    // s.merge(str);
  }, [s, state]);

  console.log('re-render', s.view());
  return input(ref, s.view(), onChange);
};
