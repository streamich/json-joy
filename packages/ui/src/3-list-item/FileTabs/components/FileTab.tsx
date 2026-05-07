import * as React from 'react';
import {makeRule, rule} from 'nano-theme';
import {BasicButtonClose} from '../../../2-inline-block/BasicButton/BasicButtonClose';
import {useT} from 'use-t';
import {useSyncStoreOpt} from '../../../hooks/useSyncStore';
import type {FileTabsState} from '../state';
import type {TabItem} from '../types';

const buttonClass = rule({
  h: '100%',
  pos: 'relative',
  z: 1,
  pd: 0,
  mr: 0,
  out: 0,
  bd: 0,
  d: 'flex',
  ai: 'center',
  fz: '13.8px',
  us: 'none',
  bg: 'transparent',
  fls: '0 0 auto',
  trs: 'width .22s cubic-bezier(.4,0,.2,1)',
  ov: 'visible',
  minWidth: 0,
  '&:focus': {
    out: 0,
  },
});

const mainClass = rule({
  h: '100%',
  flex: '1 1 0',
  minWidth: 0,
  pos: 'relative',
  d: 'flex',
  col: 'var(--filetabs-bg-txt)',
  bg: 'transparent',
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
  },
});

const closeButtonLayoutClass = rule({
  w: '100%',
  h: '100%',
  d: 'flex',
  pos: 'relative',
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
  pd: '1px 0 0',
  maskImage: 'linear-gradient(to left, transparent, white 24px)',
});

const initialMarginClass = rule({
  w: '4px',
  d: 'flex',
  fl: '0 0 auto',
});

const separatorClass = rule({
  w: 4,
  mrb: '6px',
  bxz: 'border-box',
  h: '50%',
  d: 'flex',
  fl: '0 0 auto',
  bdr: '2px solid var(--filetabs-hover)',
  trs: 'opacity 0.2s',
});

const buttonSmallClass = rule({
  [`& .${mainClass.trim()}`]: {
    pdl: '4px',
    pdr: '2px',
  },
  [`& .${initialMarginClass.trim()}`]: {
    w: 2,
  },
  // [`& .${mainPillClass.trim()}`]: {
  //   pd: '0 2px 0 6px',
  // },
  [`& .${separatorClass.trim()}`]: {
    w: 3,
    bdr: '1px solid var(--filetabs-hover)',
  },
  [`& .${iconLayoutClass.trim()}`]: {
    gap: '4px',
  },
  [`& .${titleClass.trim()}`]: {
    maskImage: 'linear-gradient(to left, transparent, white 12px)',
  },
});

const buttonXSmallClass = rule({
  [`& .${mainClass.trim()}`]: {
    pdl: '2px',
    pdr: '1px',
  },
  // [`& .${mainPillClass.trim()}`]: {
  //   pd: '0 0 0 4px',
  // },
  [`& .${iconLayoutClass.trim()}`]: {
    gap: '2px',
  },
  [`& .${initialMarginClass.trim()}`]: {
    w: 1,
  },
  [`& .${separatorClass.trim()}`]: {
    w: 2,
    h: '69%',
    bdr: '1px solid var(--filetabs-hover)',
  },
  [`& .${titleClass.trim()}`]: {
    maskImage: 'linear-gradient(to left, transparent, white 8px)',
  },
});

const buttonXXSmallClass = rule({
  [`& .${mainClass.trim()}`]: {
    pdl: '1px',
    pdr: '0px',
  },
  [`& .${initialMarginClass.trim()}`]: {
    w: 0,
    d: 'none',
  },
  [`& .${mainPillClass.trim()}`]: {
    pd: '0 1px',
  },
  [`& .${separatorClass.trim()}`]: {
    w: 1,
    h: '77%',
    bdr: '1px solid var(--filetabs-hover)',
  },
  [`& .${titleClass.trim()}`]: {
    maskImage: 'linear-gradient(to left, transparent, white 4px)',
  },
});

const useDetachedCloseButtonClass = makeRule((t) => {
  return {
    pos: 'absolute',
    t: '-10px',
    r: '-6px',
    w: '18px',
    h: '18px',
    bxz: 'border-box',
    o: 0,
    trs: 'opacity .3s ease',
    pd: '1px',
    bdrad: '50%',
    bg: 'var(--filetabs-fg)',
    d: 'flex',
    ai: 'center',
    jc: 'center',
    bxsh: `${t.g(0, 0.25)} 0px 4px 8px -2px, ${t.g(0, 0.08)} 0px 0px 0px 1px`,
  };
});

export interface FileTabProps {
  id: string;
  index: number;
  state: FileTabsState;
  item: TabItem;
  disabled?: boolean;
  isExiting?: boolean;
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

export const FileTab: React.FC<FileTabProps> = ({id, index, state, item, disabled = false, isExiting = false}) => {
  const [t] = useT();
  const detachedCloseButtonClass = useDetachedCloseButtonClass();
  const width = state.tabWidth.use();
  const disabledState = !!useSyncStoreOpt(item.disabled);
  disabled = disabled || disabledState;

  // Enter animation: skip for tabs that existed on the initial render
  const skipEnter = state.initialIds.has(id);
  const [entered, setEntered] = React.useState(skipEnter);
  React.useLayoutEffect(() => {
    if (skipEnter) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [skipEnter]);
  const isAnimating = !entered || isExiting;
  const effectiveWidth = isExiting ? 0 : entered ? width : 0;

  const selectedItem = state.selected.use();
  const selected = selectedItem ? (selectedItem[0].id ?? selectedItem[0].name) === id : false;
  const hoverState = state.hovered.use();
  const hovered = hoverState?.[0] === id;
  const dragState = state.drag.use();
  const isDragging = dragState?.key === id;
  const dragDeltaX = isDragging ? dragState!.currentX - dragState!.startX : 0;
  const offsetPx = isDragging ? dragDeltaX : state.dragOffset(index);
  const style: React.CSSProperties = {
    width: effectiveWidth,
    overflow: isAnimating ? 'hidden' : undefined,
    pointerEvents: isExiting ? 'none' : undefined,
  };

  if (selected) {
    style.zIndex = 10;
  }

  const isHovered = hoverState?.[0] === id && !selected;
  const deletable = item.deletable ?? true;

  if (offsetPx) {
    style.transform = `translateX(${offsetPx}px)`;
    if (!isDragging) style.transition = 'transform .2s cubic-bezier(.4,0,.2,1), width .2s cubic-bezier(.4,0,.2,1)';
  }
  if (isDragging) {
    style.zIndex = 100;
    style.cursor = 'grabbing';
  } else if (disabled) {
    style.cursor = 'default';
    style.opacity = 0.55;
  }

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

  label = <span className={titleClass}>{label}</span>;

  let showRightBorder: boolean;
  if (dragState) {
    const {startIndex: si, currentIndex: ci} = dragState;
    const isGhost = index === si;
    const leftNeighborDom = si < ci ? ci : ci - 1;
    const isGhostLeftNeighbor = index === leftNeighborDom;
    showRightBorder = !selected && !isGhost && !isGhostLeftNeighbor;
  } else {
    showRightBorder =
      !selected &&
      !hovered &&
      (hoverState?.[1] ?? 0) - 1 !== index &&
      (selectedItem ? selectedItem[1] !== index + 1 : true);
  }
  let showCloseButton = deletable;
  if (!selected && width < 50) showCloseButton = false;

  let inner: React.ReactNode = label;

  if (showCloseButton) {
    let button = (
      <BasicButtonClose
        comp="span"
        role="button"
        rounder={width > 50}
        round={width <= 50}
        size={width > 84 ? 24 : width > 50 ? 20 : 16}
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
    );
    if (width < 40) {
      button = (
        <span className={detachedCloseButtonClass} style={{opacity: isAnimating ? 0 : 1}}>
          {button}
        </span>
      );
    }
    inner = (
      <span className={closeButtonLayoutClass}>
        {label}
        {button}
      </span>
    );
  }

  return (
    <button
      ref={isExiting ? void 0 : state.tabRef(id)}
      role="tab"
      type="button"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={selected ? 0 : -1}
      className={
        buttonClass +
        (width <= 16 ? buttonXXSmallClass : width <= 36 ? buttonXSmallClass : width <= 60 ? buttonSmallClass : '')
      }
      style={style}
      onPointerDown={(e) => {
        if (disabled || isExiting) return;
        if (e.button !== 0) return;
        state.select(index);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        state.dragStart(id, index, e.clientX, e.pointerId);
      }}
      onDoubleClick={() => {
        if (disabled || isExiting) return;
        state.onTabDoubleClick?.(item, index);
      }}
      onMouseEnter={() => state.hovered.set([id, index])}
      onMouseLeave={() => {
        if (state.hovered.value?.[0] === id) state.hovered.set(null);
      }}
    >
      <span className={initialMarginClass} />
      <span className={mainClass + (selected ? mainTabClass : mainPillClass) + (isHovered ? outerHoveredClass : '')}>
        <span className={innerClass}>{inner}</span>
      </span>
      <span className={separatorClass} style={{opacity: showRightBorder ? 1 : 0}} />
    </button>
  );
};
