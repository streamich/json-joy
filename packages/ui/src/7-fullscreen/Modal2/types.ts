import type * as React from 'react';

/**
 * Sizing preset for the modal panel.
 *
 * - `auto` shrink-wraps the content (capped to the viewport).
 * - `prompt` is a small fixed-width box (alerts, confirms).
 * - `page` is a wide box up to `width`, with its own internal scroll.
 * - `full` stretches to the viewport, minus `inset` padding.
 */
export type ModalSize = 'auto' | 'prompt' | 'page' | 'full';

/**
 * Backdrop appearance behind the panel. Any CSS color string is also accepted
 * and used verbatim as the overlay background.
 *
 * - `dim` darkens the page behind the modal.
 * - `blur` darkens and blurs the page.
 * - `frost` is a light, saturated "frosted glass" blur.
 * - `none` is transparent.
 */
export type ModalBackdrop = 'dim' | 'blur' | 'frost' | 'none' | (string & {});

export interface ModalProps {
  /**
   * Controls visibility. When omitted the modal is open for as long as it is
   * mounted, leaving mount/unmount to the parent.
   */
  open?: boolean;

  /** Sizing preset. Defaults to `auto`. */
  size?: ModalSize;

  /** Target width in px for the `prompt` and `page` sizes. */
  width?: number;

  /** Distance in px from the viewport edges for the `full` size. */
  inset?: number;

  /** Unified close handler: invoked by Esc, backdrop click and the close button. */
  onClose?: () => void;

  /** Header title. Renders a default header row, with a close button if asked. */
  title?: React.ReactNode;

  /** Custom header. Replaces the default title-based header entirely. */
  header?: React.ReactNode;

  /** Footer content. Rendered as a sticky footer row below the body. */
  footer?: React.ReactNode;

  /** Show a close (X) button. Floats top-right when there is no header. */
  closeButton?: boolean;

  /**
   * ARIA role for the dialog. Use `alertdialog` for messages that interrupt the
   * user and require a response (confirmations, destructive actions). Defaults
   * to `dialog`.
   */
  role?: 'dialog' | 'alertdialog';

  /** Backdrop appearance. Defaults to `dim`. */
  backdrop?: ModalBackdrop;

  /** Close when Esc is pressed. Routed to the top-most modal only. Default true. */
  closeOnEsc?: boolean;

  /** Close when the area outside the panel is clicked. Default true. */
  closeOnBackdrop?: boolean;

  /** Trap keyboard focus inside the modal. Default true. */
  lockFocus?: boolean;

  /** Prevent the page behind the modal from scrolling. Default true. */
  lockScroll?: boolean;

  /**
   * Render the panel without its own chrome (no background, shadow, border
   * radius or padding) and without the scroll area. Use when the child supplies
   * its own card surface, e.g. `ConfirmPrompt` or a `ContextPane`.
   */
  bare?: boolean;

  /** Remove the default padding around the body. */
  noPadding?: boolean;

  /** Disable the open/close animations. */
  noAnimation?: boolean;

  /** Extra class name for the panel element. */
  className?: string;

  children?: React.ReactNode;
}
