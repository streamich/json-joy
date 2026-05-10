import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {ScrollState} from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';

const overlayClass = rule({
  pos: 'absolute',
  top: '0',
  l: '0',
  r: '0',
  b: '0',
  z: 50,
  d: 'flex',
  fld: 'column',
  animation: 'fadeIn .12s',
});

const HEADER_HEIGHT = 48;

const headerClass = rule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  h: HEADER_HEIGHT + 'px',
  paddingBlock: 0,
  paddingInlineStart: '12px',
  paddingInlineEnd: '12px',
  bxz: 'border-box',
  '-webkit-app-region': 'drag', // Drag for Electron app.
  '& button, & a, & input, & textarea, & select, & [role="button"], & [role="tablist"], & [role="img"]': {
    '-webkit-app-region': 'no-drag',
  },
});

const titleClass = rule({
  pos: 'absolute',
  l: '50%',
  tr: 'translateX(-50%)',
  fz: '14px',
  fw: '600',
  letterSpacing: '0.005em',
  ws: 'nowrap',
  pointerEvents: 'none',
});

export interface ModalOverlayProps {
  open: boolean;
  title?: React.ReactNode;
  onClose: () => void;
  children?: React.ReactNode;
}

/**
 * A modal that overlays the editor area.
 */
export const ModalOverlay: React.FC<ModalOverlayProps> = ({open, title, onClose, children}) => {
  const styles = useStyles();
  const theme = useTheme();
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const scrollState = React.useMemo(() => new ScrollState(), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  // When the modal opens, programmatically focus the scrollable viewport so
  // the user can scroll with arrow keys / Space / PgUp / PgDn immediately.
  React.useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const id = requestAnimationFrame(() => {
      scrollState.viewportEl?.focus({preventScroll: true});
    });
    return () => {
      cancelAnimationFrame(id);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        try {
          previouslyFocused.focus({preventScroll: true});
        } catch {}
      }
    };
  }, [open, scrollState]);

  if (!open) return null;

  const overlayBg = theme.bg;
  const borderColor = styles.g(0, 0.08);

  return (
    <div className={overlayClass} style={{background: overlayBg}} role="dialog" aria-modal="true">
      <ScrollArea.ScrollArea state={scrollState} shadowFlat>
        <ScrollArea.Header>
          <div className={headerClass} style={{background: overlayBg, borderBottom: `1px solid ${borderColor}`}}>
            <span className={titleClass} style={{color: styles.g(0.1, 0.95)}}>
              {title}
            </span>
            <BasicButtonClose rounder onClick={onClose} title="Close (Esc)" />
          </div>
        </ScrollArea.Header>
        <ScrollArea.Viewport tabIndex={-1} style={{outline: 'none'}}>
          {children}
        </ScrollArea.Viewport>
        <ScrollArea.ScrollRail>
          <ScrollArea.Thumb />
        </ScrollArea.ScrollRail>
      </ScrollArea.ScrollArea>
    </div>
  );
};
