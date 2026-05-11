import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton, BasicButtonProps} from '../../2-inline-block/BasicButton';
import {WithShortcut} from '../../2-inline-block/WithShortcut';
import {MiniTitle} from '../../3-list-item/MiniTitle';
import {ContextPane} from '../ContextMenu';
import {useStyles} from '../../styles/context';

const containerClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '4px',
  pd: '16px',
  bxz: 'border-box',
  maxW: '90vw',
});

const innerClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '8px',
  pd: '0 16px',
});

const headerClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '4px',
});

const headerTitleClass = rule({
  col: 'var(--colTxtSharp)',
  mr: 0,
  fz: '16px',
  fw: 600,
});

const bodyClass = rule({
  col: 'var(--colTxtLite)',
  fz: '14px',
  lh: 1.5,
  mr: 0,
});

const footerClass = rule({
  d: 'flex',
  ai: 'center',
  jc: 'flex-end',
  gap: '8px',
  mrt: '16px',
});

export interface ConfirmPromptProps {
  miniTitle?: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel: React.ReactNode;
  cancelLabel?: React.ReactNode;
  confirmShortcut?: React.ReactNode | null;
  cancelShortcut?: React.ReactNode | null;
  confirmProps?: BasicButtonProps;
  cancelProps?: BasicButtonProps;
  positive?: boolean;

  onConfirm?: () => void;
  onCancel?: () => void;

  /**
   * Auto-focuses the prompt container on mount so the host's keyboard
   * shortcuts don't steal Enter/Esc. Default: `true`.
   */
  autoFocus?: boolean;

  /**
   * Capture Enter/Esc at the window level (capture phase) while the prompt
   * is mounted. Useful when the prompt is rendered above a contenteditable
   * or other focus-stealing host. Default: `true`.
   */
  captureKeysGlobally?: boolean;

  /** Width of the pane. Default: `444`. */
  width?: number | string;
}

export const ConfirmPrompt: React.FC<ConfirmPromptProps> = ({
  miniTitle,
  title,
  children,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmShortcut = 'Enter',
  cancelShortcut = 'Esc',
  confirmProps,
  cancelProps,
  positive,
  onConfirm,
  onCancel,
  autoFocus = true,
  captureKeysGlobally = true,
  width = 444,
}) => {
  const styles = useStyles();

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        onConfirm?.();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onCancel?.();
      }
    },
    [onConfirm, onCancel],
  );

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!autoFocus) return;
    const el = containerRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      try {
        el.focus({preventScroll: true});
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
  }, [autoFocus]);

  React.useEffect(() => {
    if (!captureKeysGlobally) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onConfirm?.();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onCancel?.();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [captureKeysGlobally, onConfirm, onCancel]);

  const cancelBtn = (
    <BasicButton type="button" width="auto" height={32} border onClick={onCancel} {...cancelProps}>
      {cancelLabel}
    </BasicButton>
  );

  const confirmBtn = (
    <BasicButton
      type="button"
      width="auto"
      height={32}
      border
      positive={positive}
      {...confirmProps}
      onClick={onConfirm}
    >
      {confirmLabel}
    </BasicButton>
  );

  return (
    <ContextPane>
      <div
        ref={containerRef}
        className={containerClass}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={{outline: 'none', width}}
      >
        {miniTitle !== undefined && miniTitle !== null && (
          <MiniTitle style={{alignSelf: 'flex-end'}}>{miniTitle}</MiniTitle>
        )}
        <div className={innerClass}>
          <div className={headerClass}>
            <h2 className={headerTitleClass}>
              {title}
            </h2>
          </div>
          {children !== undefined && children !== null && (
            <p className={bodyClass}>
              {children}
            </p>
          )}
        </div>
        <div className={footerClass}>
          {cancelShortcut == null ? (
            cancelBtn
          ) : (
            <WithShortcut shortcut={cancelShortcut}>{cancelBtn}</WithShortcut>
          )}
          {confirmShortcut == null ? (
            confirmBtn
          ) : (
            <WithShortcut shortcut={confirmShortcut}>{confirmBtn}</WithShortcut>
          )}
        </div>
      </div>
    </ContextPane>
  );
};
