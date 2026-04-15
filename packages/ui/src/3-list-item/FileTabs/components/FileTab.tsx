import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButtonClose} from '../../../2-inline-block/BasicButton/BasicButtonClose';
import {useT} from 'use-t';
import type {FileTabsState} from '../state';
import type {TabItem} from '../types';

const buttonClass = rule({
  h: '100%',
  pos: 'relative',
  pd: 0,
  mr: 0,
  out: 0,
  bd: 0,
  // bd: '1px solid red',
  d: 'flex',
  ai: 'center',
  // fld: 'row',
  // fls: '0 0 auto',
  // gap: '4px',
  // col: 'var(--filetabs-bg-txt)',
  // bg: 'var(--filetabs-fg)',
  us: 'none',
  bg: 'transparent',
  trs: 'width .22s cubic-bezier(.4,0,.2,1)',
  ov: 'visible',
  minWidth: 0,
  z: 1,
  '&:focus': {
    out: 0,
  },
});


const mainClass = rule({
  h: '100%',
  flex: '1 1 0',
  minWidth: 0,
  pos: 'relative',
  // pd: 0,
  // mr: 0,
  // out: 0,
  // bd: 0,
  // bd: '1px solid red',
  d: 'flex',
  // ai: 'center',
  // fld: 'row',
  // fls: '0 0 auto',
  // gap: '4px',
  col: 'var(--filetabs-bg-txt)',
  // bg: 'var(--filetabs-fg)',
  // us: 'none',
  bg: 'transparent',
  trs: 'background .12s ease,color .12s ease',
  ov: 'visible',
  z: 1,
});

const mainPillClass = rule({
  h: 'calc(100% - 6px)',
  mr: '0 0 6px',
  pd: '0 4px 0 8px',
  bdrad: '10px',
  z: 2,
  // pd: '0 4px',
  '&:hover': {
    col: 'var(--filetabs-hover-txt)',
    bg: 'var(--filetabs-hover)',
  },
});

const outerHoveredClass = rule({
  
});

const mainTabClass = rule({
  col: 'var(--filetabs-fg-txt)',
  bg: 'var(--filetabs-fg)',
  bdrad: '10px 10px 0 0',
  z: 3,
  pd: '0 4px 0 8px',
});

const innerClass = rule({
  w: '100%',
  h: '100%',
  d: 'flex',
  fld: 'row',
  fls: '1 1 0',
  ai: 'center',
  gap: '4px',
  minWidth: 0,
});

const innerSelectedClass = rule({

});

const iconLayoutClass = rule({
  d: 'flex',
  h: '100%',
  fld: 'row',
  fls: '0 0 auto',
  ai: 'center',
  gap: '4px',
  '& svg': {
    display: 'flex',
  }
});

const closeButtonLayoutClass = rule({
  // bd: '1px solid red',
  w: '100%',
  h: '100%',
  d: 'flex',
  fld: 'row',
  fls: '0 0 auto',
  justifyContent: 'space-between',
  ai: 'center',
});

const titleClass = rule({
  pos: 'relative',
  ov: 'hidden',
  ws: 'nowrap',
  flex: '1 1 0',
  minWidth: 0,
  ta: 'left',
  '&::after': {
    content: '""',
    pos: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    w: '24px',
    bg: 'linear-gradient(to right, transparent, var(--filetabs-bg))',
    pointerEvents: 'none',
  },
  [`.${mainTabClass.trim()} &::after`]: {
    bg: 'linear-gradient(to right, transparent, var(--filetabs-fg))',
  },
});


export interface FileTabProps {
  id: string;
  state: FileTabsState;
  item: TabItem;
  disabled?: boolean;
  dragging?: boolean;
  offsetPx?: number;
  // dragDelta?: number;
  // indexOffsetPx: number;
  onActivate?: (id: string) => void;
  onPointerDown?: (id: string, index: number, e: React.PointerEvent<HTMLElement>) => void;
  onMouseEnter?: (id: string, el: HTMLElement) => void;
  onMouseLeave?: (id: string) => void;
  onClose?: (id: string) => void;
}

export const FileTab: React.FC<FileTabProps> = ({id, state, item, disabled = false, offsetPx = 0}) => {
  const [t] = useT();
  const width = state.tabWidth.use();
  const selected = state.selected.use() === id;
  const style: React.CSSProperties = {
    width,
  };

  if (offsetPx) style.transform = `translateX(${offsetPx}px)`;

  const iconElement = !!item.icon && <span>{item.icon()}</span>;

  let label: React.ReactNode = item.display?.() ?? item.name ?? item.id;

  if (item.icon) {
    label = (
      <span className={iconLayoutClass}>
        {iconElement}
        {label}
      </span>
    );
  }

  label = (
    <span className={titleClass}>
      {label}
    </span>
  );

  const showCloseButton = true;

  let inner: React.ReactNode = label;

  if (showCloseButton) {
    inner = (
      <span className={closeButtonLayoutClass}>
        {label}
        <BasicButtonClose
          comp="span"
          role="button"
          rounder
          // size={20}
          tabIndex={-1}
          aria-label={t('Close tab')}
          onPointerDown={(e) => {
            // e.stopPropagation();
          }}
          onClick={(e) => {
            // e.stopPropagation();
          }}
        />
      </span>
    );
  }

  // if (!selected) {
  //   inner = (
  //     <span className={hoverableClass}>{inner}</span>
  //   );
  // }

  return (
    <button
      ref={() => {}}
      role="tab"
      type="button"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={selected ? 0 : -1}
      className={buttonClass}
      style={style}
      // onClick={handleClick}
      // onPointerDown={handlePointerDown}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={onMouseLeave}
    >
      <span style={{width: 4, display: 'flex', flex: '0 0 auto'}} />
      <span className={mainClass + (selected ? mainTabClass : mainPillClass)}>
        <span className={innerClass + (selected ? innerSelectedClass : '')}>
          {inner}
        </span>
      </span>
      <span style={{width: 4, height: '50%', display: 'flex', flex: '0 0 auto', borderRight: '2px solid var(--filetabs-hover)'}} />
    </button>
  );
};