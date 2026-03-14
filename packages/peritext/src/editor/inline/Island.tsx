import {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import {keyframes} from 'nano-theme';
import * as React from 'react';

const outlineAnimation = keyframes({
  from: {
    outlineOffset: '-1px',
  },
  to: {
    outlineOffset: '2px',
  },
});

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
    const selection = inline.selection();
    const isExactSelection = !!selection?.[0] && !!selection?.[1];
    if (isExactSelection) {
      style.outline = '2px solid var(--caret-color)';
      style.animation = outlineAnimation + ' .1s ease-out',
      style.animationFillMode = 'forwards';
      style.borderRadius = '2px';
    }
    style.background = 'var(--selection-color)';
  }

  return (
    <span {...rest} style={style} contentEditable={false}>
      {children}
    </span>
  );
};
