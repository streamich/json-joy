import {keyframes, rule, lightTheme as theme} from 'nano-theme';
import * as React from 'react';
import FocusLock from 'react-focus-lock';
import useMedia from 'react-use/lib/useMedia';
import {useT} from 'use-t';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import * as ScrollArea from '../../4-card/ScrollArea';
import {useStyles} from '../../styles/context';
import {Portal} from '../../utils/portal';
import {ModalContext} from './context';
import {ModalFooter} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import type {ModalProps} from './types';
import {useModalLayer} from './useModalLayer';

const {useCallback, useId, useMemo, useRef} = React;

/** Minimum gap between the panel and the viewport edges. */
const GAP = 24;

// Panel entrance: fade in while sliding up from below. The ease-out-expo curve
// front-loads the motion so it reads as snappy but still settles smoothly.
// `both` holds the start frame before paint so there is no flash at full opacity.
const panelKeyframes = keyframes({
  from: {opacity: 0, transform: 'translateY(42px)'},
  to: {opacity: 1, transform: 'translateY(0)'},
});
const PANEL_ANIM = `${panelKeyframes} .24s cubic-bezier(.16,1,.3,1) both`;

// Under prefers-reduced-motion the slide is dropped for a plain opacity fade.
const PANEL_ANIM_REDUCED = 'fadeIn .12s ease-out';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// The backdrop fades in more gently behind the panel.
const OVERLAY_ANIM = 'fadeIn .28s ease-out';

const overlayClass = rule({
  pos: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  d: 'flex',
  ai: 'center',
  jc: 'center',
  bxz: 'border-box',
});

const panelClass = rule({
  pos: 'relative',
  d: 'flex',
  fld: 'column',
  bxz: 'border-box',
  ov: 'hidden',
  bdrad: '12px',
  maxW: `calc(100vw - ${2 * GAP}px)`,
  maxH: `calc(100vh - ${2 * GAP}px)`,
});

const barePanelClass = rule({
  pos: 'relative',
  d: 'flex',
  fld: 'column',
  bxz: 'border-box',
  maxW: `calc(100vw - ${2 * GAP}px)`,
  maxH: `calc(100vh - ${2 * GAP}px)`,
});

const scrollClass = rule({
  fl: '1 1 auto',
  minH: 0,
  w: '100%',
});

// A single block wrapper around the body so multi-element children (e.g. a
// page that returns a Fragment of sections) stack vertically instead of
// becoming flex items in the ScrollArea viewport's flex row.
const bodyClass = rule({
  w: '100%',
  bxz: 'border-box',
});

const bodyPadClass = rule({
  pad: `${theme.space(2)}px`,
});

const floatCloseClass = rule({
  pos: 'absolute',
  // Above the ScrollArea root (z:10) so the close button stays clickable.
  z: 30,
  top: '8px',
  right: '8px',
});

const sizePanelStyle = (size: ModalProps['size'], width?: number, inset?: number): React.CSSProperties => {
  switch (size) {
    case 'prompt':
      return {width: `min(${width ?? 420}px, calc(100vw - ${2 * GAP}px))`};
    case 'page':
      // A definite height (not just max-height) is required for the inner
      // ScrollArea to scroll; without it the viewport's 100% height is
      // indefinite and content is clipped instead of scrolling.
      return {
        width: `min(${width ?? 960}px, calc(100vw - ${2 * GAP}px))`,
        height: `calc(100vh - ${2 * GAP}px)`,
      };
    case 'full': {
      const pad = inset ?? 0;
      return {
        width: `calc(100vw - ${2 * pad}px)`,
        height: `calc(100vh - ${2 * pad}px)`,
        maxWidth: 'none',
        maxHeight: 'none',
        borderRadius: pad > 0 ? '12px' : 0,
      };
    }
    default:
      return {};
  }
};

const backdropStyle = (backdrop: ModalProps['backdrop'], light?: boolean): React.CSSProperties => {
  switch (backdrop) {
    case 'none':
      return {background: 'transparent'};
    case 'blur': {
      const filter = 'blur(4px)';
      return {
        background: light ? 'rgba(0,0,0,.2)' : 'rgba(0,0,0,.4)',
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
      };
    }
    case 'frost': {
      const filter = 'saturate(170%) blur(10px)';
      return {
        background: light ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)',
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
      };
    }
    case undefined:
    case 'dim':
      return {background: light ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.55)'};
    default:
      return {background: backdrop};
  }
};

const ModalInner: React.FC<ModalProps> = ({
  size = 'auto',
  width,
  inset,
  onClose,
  title,
  header,
  footer,
  closeButton,
  backdrop = 'dim',
  closeOnEsc = true,
  closeOnBackdrop = true,
  lockFocus = true,
  lockScroll = true,
  role = 'dialog',
  bare,
  noPadding,
  noAnimation,
  className,
  children,
}) => {
  const styles = useStyles();
  const [t] = useT();
  const reduceMotion = useMedia(REDUCED_MOTION, false);
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const close = useCallback(() => onCloseRef.current?.(), []);
  const zIndex = useModalLayer({onEsc: close, closeOnEsc, lockScroll, inert: lockFocus, rootRef: overlayRef});

  // Close only when both the press and the release land on the backdrop itself,
  // so a drag started inside the panel does not dismiss it.
  const pressedBackdrop = useRef(false);
  const onMouseDown = useCallback((event: React.MouseEvent) => {
    pressedBackdrop.current = event.target === event.currentTarget;
  }, []);
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && pressedBackdrop.current && event.target === event.currentTarget) close();
      pressedBackdrop.current = false;
    },
    [closeOnBackdrop, close],
  );

  const ctxValue = useMemo(() => ({onClose: close}), [close]);

  const overlayStyle: React.CSSProperties = {
    zIndex,
    ...backdropStyle(backdrop, styles.light),
  };
  if (!noAnimation) overlayStyle.animation = OVERLAY_ANIM;

  const panelStyle: React.CSSProperties = bare
    ? {}
    : {
        background: styles.bg + '',
        boxShadow: styles.light
          ? '0 0 3px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.05), 0 5px 20px rgba(0,0,0,.06), 0 20px 44px rgba(0,0,0,.07)'
          : `0 0 0 1px ${styles.g(0.1, 0.16)}, 0 20px 44px rgba(0,0,0,.5)`,
        ...sizePanelStyle(size, width, inset),
      };
  if (!noAnimation) panelStyle.animation = reduceMotion ? PANEL_ANIM_REDUCED : PANEL_ANIM;

  const hasHeaderRow = header !== undefined || title !== undefined;
  // Default header carries the title id so the dialog can reference it via
  // aria-labelledby (works for any title node). A custom `header` is opaque, so
  // there we fall back to aria-label when the title is a plain string.
  const usesDefaultHeader = header === undefined && title !== undefined;
  const headerNode = hasHeaderRow ? (
    header !== undefined ? (
      header
    ) : (
      <ModalHeader title={title} titleId={titleId} closeButton={closeButton} divider />
    )
  ) : null;
  const footerNode = footer !== undefined ? <ModalFooter divider>{footer}</ModalFooter> : null;
  const floatingClose = closeButton && !hasHeaderRow && !!onClose;
  // Bare modals render no header, so there is no element with `titleId`; fall
  // back to aria-label from a string title instead.
  const labelledBy = usesDefaultHeader && !bare ? titleId : undefined;
  const ariaLabel = !labelledBy && typeof title === 'string' ? title : undefined;

  return (
    <Portal>
      <ModalContext.Provider value={ctxValue}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismissal; keyboard users close via Esc (handled by the modal stack) */}
        <div ref={overlayRef} className={overlayClass} style={overlayStyle} onMouseDown={onMouseDown} onClick={onClick}>
          <FocusLock disabled={!lockFocus} returnFocus>
            {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is always dialog or alertdialog, both of which support aria-modal */}
            <div
              className={(bare ? barePanelClass : panelClass) + (className ? ' ' + className : '')}
              style={panelStyle}
              role={role}
              aria-modal="true"
              aria-labelledby={labelledBy}
              aria-label={ariaLabel}
            >
              {bare ? (
                children
              ) : (
                <ScrollArea.ScrollArea className={scrollClass} shadowFlat>
                  {headerNode && <ScrollArea.Header>{headerNode}</ScrollArea.Header>}
                  <ScrollArea.Viewport tabIndex={-1} style={{outline: 'none'}}>
                    <div className={bodyClass + (noPadding ? '' : ' ' + bodyPadClass)}>{children}</div>
                  </ScrollArea.Viewport>
                  {footerNode && <ScrollArea.Footer>{footerNode}</ScrollArea.Footer>}
                  <ScrollArea.ScrollRail>
                    <ScrollArea.Thumb />
                  </ScrollArea.ScrollRail>
                </ScrollArea.ScrollArea>
              )}
              {floatingClose && !bare && (
                <div className={floatCloseClass}>
                  <BasicButtonClose rounder size={32} onClick={close} tabIndex={-1} title={`${t('Close')} (Esc)`} />
                </div>
              )}
            </div>
          </FocusLock>
        </div>
      </ModalContext.Provider>
    </Portal>
  );
};

export const Modal: React.FC<ModalProps> = (props) => {
  if (props.open === false) return null;
  return <ModalInner {...props} />;
};
