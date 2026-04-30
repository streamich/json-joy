import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {cn} from '../utils/classNames';
import type {DividerProps} from '../types';
import type {CSSProperties} from 'react';
import {useStyles} from '../../../styles/context';

const blockClass = rule({
  pos: 'relative',
  z: 2,
  w: '17px',
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
  us: 'none',
  '&:focus': {
    out: 'none',
  },
});

const handleClass = drule({
  w: '1px',
  h: '100%',
  bxz: 'border-box',
  trs: 'background .3s, width .06s, height .06s',
  bdrad: '2px',
  [`.${blockClass.trim()}:hover &`]: {
    w: '5px',
    bg: 'rgba(127,127,127,.2)',
    h: 'calc(100% - 4px)',
  },
  [`.${blockClass.trim()}:focus &`]: {
    w: '3px',
    h: 'calc(100% - 16px)',
  },
  [`.${blockClass.trim()}:active &`]: {
    w: '3px',
    h: 'calc(100% - 16px)',
  },
});

export interface SlimDividerProps extends DividerProps {
  wide?: boolean;
  maxHeight?: number;
  handle?: (handle: React.ReactNode) => React.ReactNode;
}

export const SlimDivider: React.FC<SlimDividerProps> = (props) => {
  const {
    direction,
    index,
    isDragging,
    disabled,
    onPointerDown,
    onKeyDown,
    className,
    style,
    currentSize,
    minSize,
    maxSize,
    maxHeight,
    wide,
    handle,
  } = props;
  const styles = useStyles();

  const orientation = direction === 'horizontal' ? 'vertical' : 'horizontal';

  const defaultStyle: CSSProperties = {
    flex: 'none',
    position: 'relative',
    userSelect: 'none',
    touchAction: 'none',
    ...(direction === 'horizontal'
      ? {
          width: '1px',
          cursor: disabled ? 'default' : 'col-resize',
        }
      : {
          height: '1px',
          cursor: disabled ? 'default' : 'row-resize',
        }),
    ...(isDragging && {
      cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    }),
  };

  const combinedStyle: CSSProperties = {
    ...defaultStyle,
    ...style,
    width: '10px',
  };

  const combinedClassName = cn(blockClass, direction, isDragging && 'dragging', className);

  const label = `${orientation} divider ${index + 1}`;
  const instructions =
    'Use arrow keys to resize. Hold Shift for larger steps. Press Home or End to minimize or maximize.';

  // Don't pass Infinity to ARIA attributes - screen readers can't handle it
  const ariaValueMax = maxSize === undefined || maxSize === Infinity ? undefined : maxSize;

  const handleElement = (
    <div
      className={handleClass({
        bg: styles.g(0, 0.08),
        w: wide ? '3px' : '1px',
        [`.${blockClass.trim()}:focus &`]: {
          bg: styles.g(0, 0.16),
        },
        [`.${blockClass.trim()}:active &`]: {
          // bg: styles.g(0, 0.24),
          bg: styles.col.accent(0, 5),
        },
      })}
      style={maxHeight ? {maxHeight} : undefined}
      contentEditable={false}
    />
  );

  return (
    <div
      contentEditable={false}
      className={combinedClassName}
      style={combinedStyle}
      role="separator"
      aria-orientation={orientation}
      aria-label={label}
      aria-valuenow={currentSize}
      aria-valuemin={minSize}
      aria-valuemax={ariaValueMax}
      aria-description={instructions}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={disabled ? undefined : onPointerDown}
      onKeyDown={disabled ? undefined : onKeyDown}
      data-divider-index={index}
    >
      {handle ? handle(handleElement) : handleElement}
    </div>
  );
};
