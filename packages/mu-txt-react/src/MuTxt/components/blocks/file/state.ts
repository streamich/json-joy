import {rsync} from '@jsonjoy.com/ui';
import {Transforms} from 'slate';
import {ReactEditor} from 'slate-react';
import {downloadBlob} from '@jsonjoy.com/collaborative-ui/lib/util/downloadBlob';
import {removeFileAtPath} from '../../../behavior/file';
import type {MuTxtState} from '../../../state/MuTxtState';
import type {FileElement, FileThing, Thing} from '../../../types';

export class FileOptionsState {
  public readonly caption = rsync.val('');
  public readonly displayName = rsync.val('');

  constructor(
    public readonly mutxt: MuTxtState,
    public element: FileElement,
    public closePopup?: () => void,
  ) {
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
    const editor = this.mutxt.editor;
    const path = ReactEditor.findPath(editor, this.element);
    const nextCaption = this.caption.value.trim();
    const prevCaption = (this.element.caption ?? '').trim();
    if (nextCaption !== prevCaption) {
      if (nextCaption) {
        Transforms.setNodes(editor, {caption: nextCaption} as Partial<FileElement>, {at: path});
      } else {
        Transforms.unsetNodes(editor, 'caption', {at: path});
      }
    }
    const nextName = this.displayName.value.trim();
    const thing = this.mutxt.things.get(this.element['@thing']) as FileThing | undefined;
    if (thing && nextName !== (thing.name ?? '')) {
      this.mutxt.things.update(this.element['@thing'], {name: nextName || undefined} as Partial<Thing>);
    }
    this.closePopup?.();
  };

  public readonly remove = (): void => {
    const editor = this.mutxt.editor;
    const path = ReactEditor.findPath(editor, this.element);
    if (removeFileAtPath(editor, path)) this.closePopup?.();
  };

  public readonly download = (): void => {
    const thing = this.mutxt.things.get(this.element['@thing']) as FileThing | undefined;
    if (!thing || !thing.data) return;
    const blob = new Blob([thing.data as BlobPart], {type: thing.mimeType || 'application/octet-stream'});
    downloadBlob(blob, thing.name || 'file');
  };

  private readonly syncFromElement = (element: FileElement): void => {
    this.caption.set(element.caption ?? '');
    const thing = this.mutxt.things.get(element['@thing']) as FileThing | undefined;
    this.displayName.set(thing?.name ?? '');
  };
}
