import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Transforms, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import {removeFileAtPath} from '../../../behavior/file';
import type {FileElement, FileThing, Thing} from '../../../types';
import type {ThingsState} from '../../../things/ThingsState';

const FileOptionsStateContext = React.createContext<FileOptionsState | null>(null);

export class FileOptionsState {
  public readonly caption = rsync.val('');
  public readonly displayName = rsync.val('');

  private element: FileElement;
  private closePopup?: () => void;

  constructor(
    private readonly editor: Editor,
    private readonly things: ThingsState,
    element: FileElement,
    closePopup?: () => void,
  ) {
    this.element = element;
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: FileElement): void => {
    this.element = element;
    this.syncFromElement(element);
  };

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setCaption = (value: string): void => {
    this.caption.set(value);
  };

  public readonly setDisplayName = (value: string): void => {
    this.displayName.set(value);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const path = ReactEditor.findPath(this.editor, this.element);
    const nextCaption = this.caption.value.trim();
    const prevCaption = (this.element.caption ?? '').trim();
    if (nextCaption !== prevCaption) {
      if (nextCaption) {
        Transforms.setNodes(this.editor, {caption: nextCaption} as Partial<FileElement>, {at: path});
      } else {
        Transforms.unsetNodes(this.editor, 'caption', {at: path});
      }
    }
    const nextName = this.displayName.value.trim();
    const thing = this.things.get(this.element['@thing']) as FileThing | null;
    if (thing && nextName !== (thing.name ?? '')) {
      this.things.update(this.element['@thing'], {name: nextName || undefined} as Partial<Thing>);
    }
    this.closePopup?.();
  };

  public readonly remove = (): void => {
    const path = ReactEditor.findPath(this.editor, this.element);
    if (removeFileAtPath(this.editor, path)) this.closePopup?.();
  };

  public readonly download = (): void => {
    const thing = this.things.get(this.element['@thing']) as FileThing | null;
    if (!thing || !thing.data) return;
    const blob = new Blob([thing.data as BlobPart], {type: thing.mimeType || 'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = thing.name || 'file';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  public readonly dispose = (): void => {};

  private readonly syncFromElement = (element: FileElement): void => {
    this.caption.set(element.caption ?? '');
    const thing = this.things.get(element['@thing']) as FileThing | null;
    this.displayName.set(thing?.name ?? '');
  };
}

export interface FileOptionsStateProviderProps {
  editor: Editor;
  things: ThingsState;
  element: FileElement;
  closePopup?: () => void;
  children: React.ReactNode;
}

export const FileOptionsStateProvider: React.FC<FileOptionsStateProviderProps> = ({
  editor,
  things,
  element,
  closePopup,
  children,
}) => {
  const stateRef = React.useRef<FileOptionsState | null>(null);
  if (!stateRef.current) stateRef.current = new FileOptionsState(editor, things, element, closePopup);
  const state = stateRef.current;

  React.useEffect(() => {
    state.setClosePopup(closePopup);
  }, [closePopup, state]);

  React.useEffect(() => {
    state.setElement(element);
  }, [element, state]);

  React.useEffect(() => {
    return () => state.dispose();
  }, [state]);

  return React.createElement(FileOptionsStateContext.Provider, {value: state}, children);
};

export const useFileOptionsState = (): FileOptionsState => {
  const state = React.useContext(FileOptionsStateContext);
  if (!state) throw new Error('FileOptionsStateContext is not available.');
  return state;
};
