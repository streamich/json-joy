import * as React from 'react';
import {rule, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';
import type {DrawerSide} from '../types';

const blockClass = rule({
  pos: 'relative',
  flexShrink: 0,
  h: '100%',
  minW: 0,
  bxz: 'border-box',
  ov: 'hidden',
  trs: 'width 220ms cubic-bezier(.22,1,.36,1)',
});

const innerClass = rule({
  d: 'flex',
  flexDirection: 'column',
  h: '100%',
  minW: 0,
  bxz: 'border-box',
});

const blockThemeClass = drule({});

const separatorThemeClass = drule({});

const leftSeparatorClass = rule({
  bdr: '1px solid transparent',
});

const rightSeparatorClass = rule({
  bdl: '1px solid transparent',
});

export interface InlineDrawerProps extends React.HTMLAttributes<HTMLElement> {
  open?: boolean;
  defaultOpen?: boolean;
  side?: DrawerSide;
  width?: number | string;
  separator?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const InlineDrawer: React.FC<InlineDrawerProps> = ({
  open = true,
  defaultOpen,
  side = 'left',
  width = 260,
  separator = true,
  onOpenChange,
  children,
  className,
  style,
  ...rest
}) => {
  const styles = useStyles();
  const dynamicClass = blockThemeClass({
    bg: styles.bg + '',
  });
  const dynamicSeparatorClass = separatorThemeClass({
    borderColor: styles.g(0, 0.08),
  });
  const resolvedWidth = typeof width === 'string' ? width : `${width}px`;

  return (
    <aside
      {...rest}
      role="navigation"
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      className={
        blockClass +
        dynamicClass +
        (separator ? dynamicSeparatorClass + (side === 'right' ? rightSeparatorClass : leftSeparatorClass) : '') +
        (className ? ' ' + className : '')
      }
      style={{
        width: open ? resolvedWidth : 0,
        ...style,
      }}
    >
      <div className={innerClass} style={{width: '100%'}}>
        {children}
      </div>
    </aside>
  );
};
