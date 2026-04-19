import * as React from 'react';
import {rule} from 'nano-theme';
import {BasicButton} from '@jsonjoy.com/ui/lib/2-inline-block/BasicButton';
import {ContextPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {MoveToViewport} from '@jsonjoy.com/ui/lib/utils/popup/MoveToViewport';

const bodyClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '12px',
  // pd: '12px',
});

const titleClass = rule({
  d: 'flex',
  jc: 'space-between',
  // ai: 'center',
  fz: '12px',
  lh: '1.45',
  pd: '16px',
});

const titleGroupClass = rule({
  d: 'flex',
  fld: 'column',
});

const actionsClass = rule({
  d: 'flex',
  jc: 'flex-end',
  gap: '8px',
  pd: '16px',
});

const contentClass = rule({
  d: 'flex',
  fld: 'column',
  gap: '12px',
  pd: '0 16px',
});

export interface EditorContextPopupProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  onCancel: () => void;
  onApply: () => void;
  applyDisabled?: boolean;
  cancelLabel?: string;
  applyLabel?: string;
  minWidth?: number;
}

export const EditorContextPopup: React.FC<EditorContextPopupProps> = ({
  title,
  subtitle,
  headerRight,
  children,
  onCancel,
  onApply,
  applyDisabled,
  cancelLabel = 'Cancel',
  applyLabel = 'Apply',
  minWidth,
}) => {
  const styles = useStyles();

  const preventMouseDown = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const handleCancel = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onCancel();
    },
    [onCancel],
  );

  const handleApply = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      onApply();
    },
    [onApply],
  );

  return (
    <MoveToViewport vertical>
      <ContextPane minWidth={minWidth}>
        <div className={bodyClass}>
          <div className={titleClass} style={{borderBottom: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`}}>
            <div className={titleGroupClass}>
              <strong style={{display: 'block', marginBottom: 4, color: styles.light ? styles.g(0.12) : styles.g(0.94)}}>
                {title}
              </strong>
              {subtitle}
            </div>
            {!!headerRight && (
              <div className={titleGroupClass}>
                {headerRight}
              </div>
            )}
          </div>
          <div className={contentClass}>
            {children}
          </div>
          <div className={actionsClass} style={{borderTop: `1px solid ${styles.g(0, styles.light ? 0.06 : 0.1)}`}}>
            <BasicButton
              type="button"
              width={'auto'}
              height={32}
              compact
              border
              onMouseDown={preventMouseDown}
              onClick={handleCancel}
            >
              {cancelLabel}
            </BasicButton>
            <BasicButton
              type="button"
              width={'auto'}
              height={32}
              compact
              border
              disabled={applyDisabled}
              onMouseDown={preventMouseDown}
              onClick={handleApply}
            >
              {applyLabel}
            </BasicButton>
          </div>
        </div>
      </ContextPane>
    </MoveToViewport>
  );
};