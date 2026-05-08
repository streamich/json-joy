import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';
import {Portal} from '../../../utils/portal/Portal';
import {useLockScrolling} from '../../../hooks/useLockScrolling';
import {useFocusTrap} from '../hooks/useFocusTrap';
import type {DrawerSide, CloseSource} from '../types';

const PANEL_INSET = '0px';
const PANEL_RADIUS = '16px';

const backdropClass = rule({
  pos: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  z: 1500,
  trs: 'opacity 200ms ease',
  '-webkit-app-region': 'no-drag',
});

const backdropThemeClass = drule({});

const panelClass = rule({
  pos: 'fixed',
  top: PANEL_INSET,
  bottom: PANEL_INSET,
  d: 'flex',
  flexDirection: 'column',
  bxz: 'border-box',
  z: 1501,
  ov: 'hidden',
  out: 0,
  op: 0,
  trs: 'transform 250ms cubic-bezier(.22,1,.36,1), opacity 180ms ease, visibility 0ms linear 250ms',
  vis: 'hidden',
  willChange: 'transform',
  '-webkit-app-region': 'no-drag',
  '&:focus': {
    out: 0,
  },
  '&:focus-visible': {
    out: 0,
  },
});

const panelOpenClass = rule({
  transform: 'translateX(0)',
  op: 1,
  trs: 'transform 250ms cubic-bezier(.22,1,.36,1), opacity 180ms ease',
  vis: 'visible',
});

const panelThemeClass = drule({});

const leftPanelShapeClass = rule({
  bdrad: `0 ${PANEL_RADIUS} ${PANEL_RADIUS} 0`,
});

const rightPanelShapeClass = rule({
  bdrad: `${PANEL_RADIUS} 0 0 ${PANEL_RADIUS}`,
});

const leftClosedClass = rule({
  transform: 'translateX(-110%)',
  left: PANEL_INSET,
});

const rightClosedClass = rule({
  transform: 'translateX(110%)',
  right: PANEL_INSET,
});

const leftOpenClass = rule({
  left: PANEL_INSET,
});

const rightOpenClass = rule({
  right: PANEL_INSET,
});

export interface OverlayDrawerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  open?: boolean;
  onOpenChange?: (open: boolean, source: CloseSource) => void;
  side?: DrawerSide;
  width?: number | string;
  modalType?: 'modal' | 'non-modal';
  backdrop?: boolean;
  preventClose?: boolean;
  mountNode?: HTMLElement | null;
  children?: React.ReactNode;
}

export const OverlayDrawer: React.FC<OverlayDrawerProps> = ({
  open = true,
  onOpenChange,
  side = 'left',
  width = 320,
  modalType = 'modal',
  backdrop = modalType === 'modal',
  preventClose,
  mountNode,
  children,
  className,
  style,
  ...rest
}) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const dynamicBackdropClass = backdropThemeClass({
    bg: theme.isLight ? 'rgba(241,245,249,.46)' : 'rgba(2,6,23,.42)',
    bdfl: 'saturate(180%) blur(14px)',
  });
  const dynamicPanelClass = panelThemeClass({
    bg: theme.isLight ? 'rgba(255,255,255,.92)' : 'rgba(19,24,32,.92)',
    bd: `1px solid ${theme.isLight ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.08)'}`,
    bdfl: 'saturate(180%) blur(18px)',
    bxsh: theme.isLight
      ? '0 1px 1px rgba(15,23,42,.06), 0 8px 22px rgba(15,23,42,.15), 0 3px 8px rgba(15,23,42,.09)'
      : '0 0 0 1px rgba(255,255,255,.04), 0 10px 28px rgba(0,0,0,.44), 0 3px 8px rgba(0,0,0,.26)',
  });

  useLockScrolling(open && modalType === 'modal');
  useFocusTrap(panelRef, open && modalType === 'modal');

  React.useEffect(() => {
    if (!open || preventClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onOpenChange?.(false, 'escape');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, preventClose, onOpenChange]);

  const onBackdropClick = React.useCallback(() => {
    if (!preventClose) onOpenChange?.(false, 'backdrop');
  }, [preventClose, onOpenChange]);

  const isLeft = side === 'left';
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

  const panel = (
    <div
      {...rest}
      ref={panelRef}
      role="dialog"
      aria-modal={modalType === 'modal' ? true : undefined}
      data-state={open ? 'open' : 'closed'}
      data-side={side}
      tabIndex={-1}
      className={
        panelClass +
        dynamicPanelClass +
        (isLeft ? leftPanelShapeClass : rightPanelShapeClass) +
        (open ? panelOpenClass : '') +
        (isLeft ? (open ? leftOpenClass : leftClosedClass) : open ? rightOpenClass : rightClosedClass) +
        (className ? ' ' + className : '')
      }
      style={{
        width: resolvedWidth,
        maxWidth: '100vw',
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (!open && !panelRef.current) return null;

  return (
    <Portal parent={mountNode ?? undefined}>
      {backdrop && open && (
        <div className={backdropClass + dynamicBackdropClass} onClick={onBackdropClick} aria-hidden="true" />
      )}
      {panel}
    </Portal>
  );
};
