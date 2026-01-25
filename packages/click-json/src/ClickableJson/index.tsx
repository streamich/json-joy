import * as React from 'react';
import {context as json} from './context';
import {StyleContextValue, context as styles} from '../context/style';
import {JsonDoc} from './JsonDoc';
import {Root} from '../Root';
import {FocusProvider} from '../context/focus';
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
}

export const ClickableJson: React.FC<ClickableJsonProps> = (props) => {
  const {onFocus} = props;
  const onChange = props.readonly ? undefined : props.onChange;

  return (
    <FocusProvider>
      <styles.Provider value={props}>
        <json.Provider value={{pfx: props.pfx ?? '', onChange}}>
          <Root onFocus={onFocus}>
            <JsonHoverable pointer="">
              <JsonDoc {...props} pointer="" onChange={onChange} />
            </JsonHoverable>
          </Root>
        </json.Provider>
      </styles.Provider>
    </FocusProvider>
  );
};
