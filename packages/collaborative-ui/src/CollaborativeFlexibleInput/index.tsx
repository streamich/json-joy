import type {CollaborativeStr} from '@jsonjoy.com/collaborative-str';
import {FlexibleInput, type FlexibleInputProps} from '@jsonjoy.com/ui/lib/2-inline-block/FlexibleInput';
import * as React from 'react';
import {CollaborativeInput} from '../CollaborativeInput';

/**
 * Props of {@link CollaborativeFlexibleInput}. This is {@link FlexibleInputProps}
 * (minus the props that drive the value through React — the value is instead
 * driven by the CRDT binding), plus the `str` node accessor and `polling`.
 */
export interface CollaborativeFlexibleInputProps
  extends Omit<FlexibleInputProps, 'value' | 'defaultValue' | 'uncontrolled' | 'onChange'> {
  /** JSON CRDT "str" node API. */
  str: () => CollaborativeStr;

  /**
   * Whether to poll for updates the underlying <input> or <textarea> element
   * in case some third-party code modifies the value of the input element.
   */
  polling?: boolean;
}

/**
 * A flexible (auto-sizing) `<input>`/`<textarea>` bound to a JSON CRDT "str"
 * node. This is a thin composition of `<CollaborativeInput>` (which owns the
 * CRDT binding) and `<FlexibleInput>` (which owns the auto-sizing UI):
 *
 * ```tsx
 * <CollaborativeInput str={str} inp={(props) => <FlexibleInput {...props} />} />
 * ```
 */
export const CollaborativeFlexibleInput: React.FC<CollaborativeFlexibleInputProps> = ({str, polling, inp, ...rest}) => {
  return (
    <CollaborativeInput
      str={str}
      polling={polling}
      multiline={rest.multiline}
      inp={(props) => <FlexibleInput {...props} {...rest} inp={inp} />}
    />
  );
};
