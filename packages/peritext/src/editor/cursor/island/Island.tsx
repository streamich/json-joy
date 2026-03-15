import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import * as React from 'react';
import {IslandFrame, IslandFrameProps} from './IslandFrame';

export interface IslandProps extends IslandFrameProps {
  inline?: Inline;
  attr?: InlineAttr;
  children?: React.ReactNode;
}

/**
 * A non-editable (contenteditable = false) island in the middle of inline text.
 */
export const Island: React.FC<IslandProps> = ({children, inline, attr, ...rest}) => {
  const selected = inline?.isSelected();
  let outline = false;
  if (selected) {
    const selection = inline?.selection();
    outline = !!selection?.[0] && !!selection?.[1];
  }

  return (
    <IslandFrame {...rest} selected={selected} outline={outline}>
      {children}
    </IslandFrame>
  );
};
