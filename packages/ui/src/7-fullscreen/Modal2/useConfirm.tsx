import * as React from 'react';
import {ConfirmPrompt} from '../../4-card/ConfirmPrompt';
import {Modal} from './Modal';
import {useModalHost} from './ModalHost';
import type {ModalBackdrop} from './types';

export interface ConfirmOptions {
  title: React.ReactNode;
  message?: React.ReactNode;
  miniTitle?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Style the confirm button as a positive (rather than destructive) action. */
  positive?: boolean;
  backdrop?: ModalBackdrop;
}

export type Confirm = (options: ConfirmOptions) => Promise<boolean>;

/**
 * Returns an imperative `confirm()` that opens a modal confirmation prompt and
 * resolves to `true` (confirmed) or `false` (cancelled / dismissed). Requires a
 * {@link ModalHostProvider} ancestor.
 */
export const useConfirm = (): Confirm => {
  const host = useModalHost();
  return React.useCallback(
    (options) =>
      new Promise<boolean>((resolve) => {
        host.open((close) => {
          // close() and resolve() are both idempotent, so it is safe for Esc /
          // backdrop and the buttons to race to settle the prompt.
          const settle = (result: boolean) => {
            close();
            resolve(result);
          };
          return (
            <Modal
              bare
              role="alertdialog"
              backdrop={options.backdrop}
              title={options.title}
              onClose={() => settle(false)}
            >
              <ConfirmPrompt
                miniTitle={options.miniTitle}
                title={options.title}
                confirmLabel={options.confirmLabel ?? 'OK'}
                cancelLabel={options.cancelLabel}
                positive={options.positive}
                onConfirm={() => settle(true)}
                onCancel={() => settle(false)}
              >
                {options.message}
              </ConfirmPrompt>
            </Modal>
          );
        });
      }),
    [host],
  );
};
