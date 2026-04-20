import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import type {Editor} from 'slate';
import {
  getActiveLink,
  hasRangeSelection,
  normalizeLinkHref,
  removeLink,
  type ActiveLink,
  upsertLink,
} from '../../../behavior/link';

const LinkToolbarStateContext = React.createContext<LinkToolbarState | null>(null);

export class LinkToolbarState {
  public readonly readOnly = rsync.val(false);
  public readonly hasSelection = rsync.val(false);
  public readonly activeLink = rsync.val<ActiveLink | null>(null);
  public readonly open = rsync.val(false);
  public readonly draft = rsync.val('');
  public readonly canOpen = rsync.comp(
    [this.readOnly, this.hasSelection, this.activeLink],
    ([readOnly, hasSelection, activeLink]) => !readOnly && (hasSelection || !!activeLink),
  );
  public readonly normalizedDraft = rsync.comp([this.draft], ([draft]) => normalizeLinkHref(draft));
  public readonly popupTitle = rsync.comp([this.activeLink], ([activeLink]) => (activeLink ? 'Edit link' : 'Add link'));
  public readonly popupSubtitle = rsync.comp([this.activeLink], ([activeLink]) =>
    activeLink
      ? 'Update the current link target, copy it, open it, or remove it.'
      : 'Enter a URL to wrap the current selection.',
  );
  public readonly selected = rsync.comp(
    [this.readOnly, this.open, this.activeLink],
    ([readOnly, open, activeLink]) => !readOnly && (open || !!activeLink),
  );

  private handledLinkMenuRequest = 0;
  private onVisualChange?: () => void;

  constructor(
    private readonly editor: Editor,
    opts?: {
      readOnly?: boolean;
      linkMenuRequest?: number;
      onVisualChange?: () => void;
    },
  ) {
    this.onVisualChange = opts?.onVisualChange;
    this.sync(opts?.readOnly, opts?.linkMenuRequest ?? 0);
  }

  public readonly setOnVisualChange = (onVisualChange?: () => void): void => {
    this.onVisualChange = onVisualChange;
  };

  public readonly sync = (readOnly?: boolean, linkMenuRequest = this.handledLinkMenuRequest): void => {
    const nextReadOnly = !!readOnly;
    const nextHasSelection = hasRangeSelection(this.editor);
    const nextActiveLink = getActiveLink(this.editor);
    const nextCanOpen = !nextReadOnly && (nextHasSelection || !!nextActiveLink);

    this.readOnly.set(nextReadOnly);
    this.hasSelection.set(nextHasSelection);
    this.activeLink.set(nextActiveLink);

    if (this.open.value && !nextCanOpen) this.close();

    if (linkMenuRequest === this.handledLinkMenuRequest) return;
    this.handledLinkMenuRequest = linkMenuRequest;
    if (!nextCanOpen) return;

    this.draft.set(nextActiveLink?.href ?? '');
    this.open.set(true);
  };

  public readonly setDraft = (value: string): void => {
    this.draft.set(value);
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;

    const nextOpen = !this.open.value;
    if (nextOpen) this.draft.set(this.activeLink.value?.href ?? '');
    this.open.set(nextOpen);
  };

  public readonly close = (): void => {
    this.open.set(false);
  };

  public readonly apply = (): void => {
    const currentDraft = this.draft.value;
    const normalizedDraft = normalizeLinkHref(currentDraft);
    if (!normalizedDraft) return;

    flushSync(() => this.open.set(false));
    const link = upsertLink(this.editor, currentDraft);
    if (!link) {
      this.draft.set(currentDraft);
      return;
    }

    this.draft.set(link.href);
    this.activeLink.set(link);
    this.hasSelection.set(hasRangeSelection(this.editor));
    this.onVisualChange?.();
  };

  public readonly remove = (): void => {
    if (!removeLink(this.editor)) return;

    this.activeLink.set(getActiveLink(this.editor));
    this.hasSelection.set(hasRangeSelection(this.editor));
    this.close();
    this.onVisualChange?.();
  };

  public readonly dispose = (): void => {};
}

export interface LinkToolbarStateProviderProps {
  editor: Editor;
  readOnly?: boolean;
  linkMenuRequest: number;
  syncVersion: number;
  onVisualChange: () => void;
  children: React.ReactNode;
}

export const LinkToolbarStateProvider: React.FC<LinkToolbarStateProviderProps> = ({
  editor,
  readOnly,
  linkMenuRequest,
  syncVersion,
  onVisualChange,
  children,
}) => {
  const stateRef = React.useRef<LinkToolbarState | null>(null);
  if (!stateRef.current)
    stateRef.current = new LinkToolbarState(editor, {
      readOnly,
      linkMenuRequest,
      onVisualChange,
    });
  const state = stateRef.current;

  React.useEffect(() => {
    state.setOnVisualChange(onVisualChange);
  }, [onVisualChange, state]);

  React.useEffect(() => {
    state.sync(readOnly, linkMenuRequest);
  }, [linkMenuRequest, readOnly, state, syncVersion]);

  React.useEffect(() => {
    return () => state.dispose();
  }, [state]);

  return React.createElement(LinkToolbarStateContext.Provider, {value: state}, children);
};

export const useLinkToolbarState = (): LinkToolbarState => {
  const state = React.useContext(LinkToolbarStateContext);
  if (!state) throw new Error('LinkToolbarStateContext is not available.');
  return state;
};