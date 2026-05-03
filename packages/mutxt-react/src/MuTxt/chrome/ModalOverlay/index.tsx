import * as React from 'react';
import {rule, useTheme} from 'nano-theme';
import {BasicButtonClose} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton/BasicButtonClose';
import * as ScrollArea from '@jsonjoy.com/ui/lib/4-card/ScrollArea';
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
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: '12px',
  h: HEADER_HEIGHT + 'px',
  pd: '0 12px 0 32px',
  bxz: 'border-box',
});

const titleClass = rule({
  fz: '14px',
  fw: '600',
  letterSpacing: '0.005em',
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

  if (!open) return null;

  const overlayBg = theme.bg;
  const borderColor = styles.light ? styles.g(0, 0.08) : styles.g(1, 0.1);

  return (
    <div className={overlayClass} style={{background: overlayBg}} role="dialog" aria-modal="true">
      <ScrollArea.ScrollArea shadowFlat>
        <ScrollArea.Header>
          <div className={headerClass} style={{background: overlayBg, borderBottom: `1px solid ${borderColor}`}}>
            <span className={titleClass} style={{color: styles.g(0.1, 0.95)}}>
              {title}
            </span>
            <BasicButtonClose rounder onClick={onClose} title="Close (Esc)" />
          </div>
        </ScrollArea.Header>
        <ScrollArea.Viewport>{children}</ScrollArea.Viewport>
        <ScrollArea.ScrollRail>
          <ScrollArea.Thumb />
        </ScrollArea.ScrollRail>
      </ScrollArea.ScrollArea>
    </div>
  );
};
