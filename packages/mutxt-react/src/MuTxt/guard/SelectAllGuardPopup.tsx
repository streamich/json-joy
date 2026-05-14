import * as React from 'react';
import {rule} from 'nano-theme';
import {useT} from 'use-t';
import {ConfirmPrompt} from '@jsonjoy.com/ui/lib/4-card/ConfirmPrompt';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import type {PendingAction, SelectAllGuardState} from './SelectAllGuardState';

const previewClass = rule({
  d: 'inline',
  fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fz: '13px',
  pd: '1px 6px',
  bdrad: '4px',
  mr: '0 2px',
  vrtAln: 'baseline',
});

const trim = (text: string, max: number): string => {
  const collapsed = text.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= max) return collapsed;
  return collapsed.slice(0, max) + '…';
};

export interface SelectAllGuardPopupProps {
  state: SelectAllGuardState;
  action: PendingAction;
}

export const SelectAllGuardPopup: React.FC<SelectAllGuardPopupProps> = ({state, action}) => {
  const [t] = useT();
  const styles = useStyles();

  const onConfirm = React.useCallback(() => state.confirm(), [state]);
  const onCancel = React.useCallback(() => state.cancel(), [state]);

  const title = action.kind === 'delete' ? t('Delete the whole document?') : t('Replace the whole document?');

  let body: React.ReactNode;
  if (action.kind === 'delete') {
    body = t('The entire document is selected. This will remove all content.');
  } else if (action.kind === 'replace-text') {
    const preview = trim(action.text, 24);
    body = (
      <>
        {t('The entire document will be replaced with')}{' '}
        <span className={previewClass} style={{background: styles.g(0.5, 0.12), color: styles.g(0.1)}}>
          {preview}
        </span>
        .
      </>
    );
  } else {
    body = t('The entire document will be replaced with the pasted content.');
  }

  return (
    <ConfirmPrompt
      miniTitle={t('Confirm')}
      title={title}
      confirmLabel={action.kind === 'delete' ? t('Delete') : t('Replace')}
      cancelLabel={t('Cancel')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {body}
    </ConfirmPrompt>
  );
};
