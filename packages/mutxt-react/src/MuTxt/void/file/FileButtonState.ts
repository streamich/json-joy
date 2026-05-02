import {rsync} from '@jsonjoy.com/ui';
import {flushSync} from 'react-dom';
import {ReactEditor} from 'slate-react';
import {s} from 'json-joy/lib/json-crdt';
import {insertFile} from '../../behavior/file';
import type {Editor} from 'slate';
import type {MuTxtState} from '../../state/MuTxtState';

export class FileButtonState {
  public readonly open = rsync.val(false);
  public readonly busy = rsync.val(false);
  public readonly anchorRect = rsync.val<DOMRect | null>(null);
  public readonly canOpen: rsync.ReactComputed<boolean>;

  private readonly editor: Editor;

  constructor(public readonly mutxt: MuTxtState) {
    this.editor = mutxt.editor;
    this.canOpen = rsync.comp([mutxt.readOnly], ([readOnly]) => !readOnly);
  }

  public readonly setAnchorRect = (rect: DOMRect | null): void => {
    this.anchorRect.set(rect);
  };

  public readonly setAnchorEl = (el: HTMLElement | null): void => {
    this.anchorRect.set(el ? el.getBoundingClientRect() : null);
  };

  public readonly setAnchorFromCaret = (): void => {
    const rect = this.mutxt.api.focusRect();
    this.anchorRect.set(rect ?? null);
  };

  public readonly toggle = (): void => {
    if (!this.canOpen.value) return;
    this.open.set(!this.open.value);
  };

  public readonly close = (): void => {
    this.open.set(false);
    this.anchorRect.set(null);
    this.mutxt.api.focus();
  };

  /**
   * Programmatically pick a file via a hidden `<input type="file">` and insert
   * it as a `<file>` block. Returns the new thing ID, or null on cancel/error.
   */
  public readonly pickAndInsert = async (): Promise<string | null> => {
    if (!this.canOpen.value) return null;
    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        document.body.removeChild(input);
        if (!file) {
          resolve(null);
          return;
        }
        try {
          const id = await this.insertFromFile(file);
          resolve(id);
        } catch {
          resolve(null);
        }
      });
      document.body.appendChild(input);
      input.click();
    });
  };

  /** Read a `File` blob and insert a `<file>` block referencing it. */
  public readonly insertFromFile = async (file: File): Promise<string | null> => {
    if (!this.canOpen.value) return null;
    flushSync(() => this.busy.set(true));
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const id = this.mutxt.things.add({
        '@type': 'file',
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: s.con(bytes),
      } as any);
      // Ensure we have an editor selection before inserting; default to end.
      if (!this.editor.selection) {
        try {
          ReactEditor.focus(this.editor as ReactEditor);
        } catch {}
      }
      insertFile(this.editor, id, undefined);
      this.mutxt.sync(true);
      return id;
    } finally {
      this.busy.set(false);
      this.close();
    }
  };
}
