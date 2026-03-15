import {rule, keyframes} from 'nano-theme';
import * as React from 'react';

const outlineAnimation = keyframes({
  from: {
    outlineOffset: '-1px',
  },
  to: {
    outlineOffset: '2px',
  },
});

const blockClass = rule({
  pos: 'relative',
  z: 100,
  // h: '100%',
  // va: 'bottom',
});

const underClass = rule({
  pos: 'absolute',
  z: 102,
  b: '-16px',
  l: '50%',
  transform: 'translateX(-50%)',
  isolation: 'isolate',
});

export interface IslandFrameProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  outline?: boolean;
  under?: React.ReactNode;
  children?: React.ReactNode;
}

export const IslandFrame: React.FC<IslandFrameProps> = ({selected, outline, under, children, ...rest}) => {
  const style: React.CSSProperties = {
    cursor: 'pointer',
    ...rest.style,
  };

  if (selected) {
    if (outline) {
      style.outline = '2px solid var(--caret-color)';
      style.animation = outlineAnimation + ' .1s ease-out',
      style.animationFillMode = 'forwards';
      style.borderRadius = '2px';
    }
    style.background = 'var(--selection-color)';
  }

  return (
    <span className={blockClass} contentEditable={false} style={{'--jsonjoy-peritext-editable': 'no'} as any}>
      <span {...rest} style={style}>
        {children}
      </span>
      {!!under && (
        <span className={underClass}>
          {under}
        </span>
      )}
    </span>
  );
};
