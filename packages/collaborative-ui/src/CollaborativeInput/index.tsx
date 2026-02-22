import * as React from 'react';
import {bind} from 'collaborative-input';
import type {CollaborativeStr} from 'collaborative-editor';

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
}

export const CollaborativeInput: React.FC<CollaborativeInputProps> = ({inp, str, polling, multiline, ...rest}) => {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const unbind = bind(str, input, !!polling);
    return () => {
      unbind();
    };
  });

  (rest as any).ref = (el: HTMLInputElement | HTMLTextAreaElement) => {
    (ref as any).current = el;
    if (typeof inp === 'function') inp(el);
    else if (inp) (inp as any).current = el;
  };

  return React.createElement(multiline ? 'textarea' : 'input', rest);
};
