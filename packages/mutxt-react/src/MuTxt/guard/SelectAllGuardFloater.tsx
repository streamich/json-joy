import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../context';
import {SelectAllGuardPopup} from './SelectAllGuardPopup';

const overlayClass = rule({
  pos: 'absolute',
  inset: 0,
  z: 1000,
  d: 'flex',
  fld: 'column',
  ai: 'center',
  jc: 'flex-start',
  bxz: 'border-box',
  WebkitBackdropFilter: 'saturate(180%) blur(10px)',
  backdropFilter: 'saturate(180%) blur(10px)',
  animation: 'guard-overlay-in .12s cubic-bezier(0.16,1,0.3,1) both',
  '@keyframes guard-overlay-in': {
    from: {opacity: 0},
    to: {opacity: 1},
  },
});

const dialogClass = rule({
  animation: 'guard-dialog-in .14s cubic-bezier(0.16,1,0.3,1) both',
  willChange: 'transform, opacity',
  '@keyframes guard-dialog-in': {
    from: {transform: 'translate3d(0,-12px,0)', opacity: 0},
    to: {transform: 'translate3d(0,0,0)', opacity: 1},
  },
});

/**
 * Modal-style overlay shown when the user is about to wipe a large document
 * via Ctrl+A then Backspace / Delete / typing.
 */
export const SelectAllGuardFloater: React.FC = () => {
  const mutxt = useMuTxt();
  const guard = mutxt.selectAllGuard;
  const open = guard.open.use();
  const action = guard.pending.use();
  const styles = useStyles();

  if (!open || !action) return null;

  // Frosted-glass tint over the shell.
  const overlayBg = styles.light ? 'rgba(245, 245, 245, 0.45)' : 'rgba(20, 20, 20, 0.45)';

  const onOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    // Only treat clicks on the backdrop itself as a cancel — clicks on the
    // dialog or its descendants must keep buttons interactive.
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.stopPropagation();
    guard.cancel();
  };

  const onDialogMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    // Suppress focus shifts that would otherwise move the contenteditable
    // selection while the dialog is open. Buttons inside still receive
    // click events because we only block mousedown's default.
    if ((event.target as HTMLElement).tagName !== 'INPUT') event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className={overlayClass}
      style={{background: overlayBg}}
      role="dialog"
      aria-modal="true"
      onMouseDown={onOverlayMouseDown}
    >
      <div className={dialogClass} onMouseDown={onDialogMouseDown}>
        <SelectAllGuardPopup state={guard} action={action} />
      </div>
    </div>
  );
};
