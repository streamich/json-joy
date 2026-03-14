import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import * as React from 'react';

export interface IslandProps extends React.HTMLAttributes<HTMLSpanElement> {
  inline?: Inline;
  attr?: InlineAttr;
  children?: React.ReactNode;
}

/**
 * A non-editable (contenteditable = false) island in the middle of inline text.
 */
export const Island: React.FC<IslandProps> = ({children, inline, attr, ...rest}) => {
  const style: React.CSSProperties = {
    cursor: 'pointer',
    ...rest.style,
  };

  if (inline?.isSelected()) {
    // style.outline = '2px solid rgba(0, 0, 255, 0.2)';
    style.outline = '2px solid blue';
    style.outlineOffset = '-1px';
    style.borderRadius = '2px';
    style.background = 'rgba(0, 0, 255, 0.1)';
  }

  return (
    <span {...rest} style={style} contentEditable={false}>
      {children}
    </span>
  );
};
