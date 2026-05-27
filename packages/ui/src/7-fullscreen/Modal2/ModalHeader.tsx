import {rule, lightTheme as theme} from 'nano-theme';
import * as React from 'react';
import {useT} from 'use-t';
import {BasicButtonClose} from '../../2-inline-block/BasicButton/BasicButtonClose';
import {useStyles} from '../../styles/context';
import {useModalContext} from './context';

const headerClass = rule({
  pos: 'relative',
  d: 'flex',
  ai: 'center',
  jc: 'space-between',
  gap: theme.space(0) + 'px',
  bxz: 'border-box',
  minH: '48px',
  pad: `0 ${theme.space(1)}px`,
});

const leftClass = rule({
  d: 'flex',
  ai: 'center',
  fl: '1 1 auto',
  minW: 0,
  ov: 'hidden',
});

const titleClass = rule({
  ...theme.font.ui1.lite,
  fz: theme.fontSize(0) + 'px',
  ws: 'nowrap',
  ov: 'hidden',
  textOverflow: 'ellipsis',
});

export interface ModalHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Convenience title rendered on the left. */
  title?: React.ReactNode;
  /** Id applied to the title element so the dialog can reference it. */
  titleId?: string;
  /** Show the close (X) button on the right. */
  closeButton?: boolean;
  /** Draw a divider line below the header. */
  divider?: boolean;
  /** Close handler for the close button. Falls back to the modal context. */
  onClose?: () => void;
  children?: React.ReactNode;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  titleId,
  closeButton,
  divider,
  onClose,
  children,
  className,
  style,
  ...rest
}) => {
  const styles = useStyles();
  const [t] = useT();
  const ctx = useModalContext();
  const close = onClose ?? ctx.onClose;

  return (
    <div
      {...rest}
      className={headerClass + (className ? ' ' + className : '')}
      style={{
        background: styles.bg + '',
        borderBottom: divider ? `1px solid ${styles.g(0, 0.08)}` : undefined,
        ...style,
      }}
    >
      <div className={leftClass}>
        {title !== undefined ? (
          <span id={titleId} className={titleClass} style={{color: styles.g(0.1, 0.95)}}>
            {title}
          </span>
        ) : (
          children
        )}
      </div>
      {closeButton && close && <BasicButtonClose rounder size={32} onClick={close} title={`${t('Close')} (Esc)`} />}
    </div>
  );
};
