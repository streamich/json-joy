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
  // w: '0px',
  // h: '100%',
  // va: 'bottom',
});

const underClass = rule({
  pos: 'absolute',
  z: 102,
  t: `1.8em`,
  l: 0,
  isolation: 'isolate',
  // transform: 'translateX(calc(-50% + 0px))',
});

export interface IslandFrameProps extends React.HTMLAttributes<HTMLSpanElement> {
  selected?: boolean;
  outline?: boolean;
  under?: React.ReactNode;
  children?: React.ReactNode;
}

export const IslandFrame: React.FC<IslandFrameProps> = ({selected, outline, under, children, ...rest}) => {
  const style: React.CSSProperties = {
    ...{'--jsonjoy-peritext-editable': 'no'},
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
    <span className={blockClass}>
      <span {...rest} style={style} contentEditable={false}>
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
