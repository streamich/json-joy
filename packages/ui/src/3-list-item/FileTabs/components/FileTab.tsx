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
  fz: '13.8px',
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
  // trs: 'background .12s ease,color .12s ease',
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
});

const outerHoveredClass = rule({
  col: 'var(--filetabs-hover-txt)',
  bg: 'var(--filetabs-hover)',
  trs: 'background .2s ease,color .2s ease',
});

const mainTabClass = rule({
  col: 'var(--filetabs-fg-txt)',
  bg: 'var(--filetabs-fg)',
  bdrad: '10px 10px 0 0',
  z: 3,
  bxz: 'border-box',
  pd: '0 4px 6px 8px',
  trs: 'background .01s ease',
  '&::before': {
    content: '""',
    pos: 'absolute',
    bottom: 0,
    left: '-10px',
    w: '10px',
    h: '10px',
    bg: 'radial-gradient(circle at top left, transparent 10px, var(--filetabs-fg) 10px)',
    pe: 'none',
  },
  '&::after': {
    content: '""',
    pos: 'absolute',
    bottom: 0,
    right: '-10px',
    w: '10px',
    h: '10px',
    bg: 'radial-gradient(circle at top right, transparent 10px, var(--filetabs-fg) 10px)',
    pe: 'none',
  },
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

const iconLayoutClass = rule({
  d: 'flex',
  h: '100%',
  fld: 'row',
  fls: '0 0 auto',
  ai: 'center',
  gap: '7px',
  '& svg': {
    display: 'flex',
  }
});

const closeButtonLayoutClass = rule({
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
  maskImage: 'linear-gradient(to left, transparent, white 24px)',
});

const separatorClass = rule({
  w: 4,
  mrb: 6,
  bxz: 'border-box',
  h: '50%',
  d: 'flex',
  fl: '0 0 auto',
  bdr: '2px solid var(--filetabs-hover)',
  trs: 'opacity 0.2s',
});


export interface FileTabProps {
  id: string;
  index: number;
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

export const FileTab: React.FC<FileTabProps> = ({id, index, state, item, disabled = false, offsetPx = 0}) => {
  const [t] = useT();
  const width = state.tabWidth.use();
  const selectedItem = state.selected.use();
  const selected = selectedItem ? ((selectedItem[0].id ?? selectedItem[0].name) === id) : false;
  const hoverState = state.hovered.use();
  const hovered = hoverState?.[0] === id;
  const style: React.CSSProperties = {
    width,
  };

  const isHovered = (hoverState?.[0] === id) && !selected;
  const deletable = item.deletable ?? true;

  if (offsetPx) style.transform = `translateX(${offsetPx}px)`;

  const iconElement = !!item.icon && <span>{item.icon()}</span>;

  let label: React.ReactNode = (
    item.display?.() ?? item.name ?? item.id
  );

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

  const showRightBorder = !selected && !hovered && ((hoverState?.[1] ?? 0) - 1 !== index) && (selectedItem ? selectedItem[1] !== index + 1 : true);
  const showCloseButton = deletable;

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
            e.stopPropagation();
            e.preventDefault();
          }}
          onClick={(e) => {
            e.stopPropagation();
            state.delete(index);
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
      onMouseDown={() => state.select(index)}
      // onClick={handleClick}
      // onPointerDown={handlePointerDown}
      onMouseEnter={() => state.hovered.set([id, index])}
      onMouseLeave={() => {
        if (state.hovered.value?.[0] === id) state.hovered.set(null);
      }}
    >
      <span style={{width: 4, display: 'flex', flex: '0 0 auto'}} />
      <span className={mainClass + (selected ? mainTabClass : mainPillClass) + (isHovered ? outerHoveredClass : '')}>
        <span className={innerClass}>
          {inner}
        </span>
      </span>
      <span className={separatorClass} style={{opacity: showRightBorder ? 1 : 0}} />
    </button>
  );
};