import {saveSelection} from '../../../../util/dom';
import type {PeritextClipboard, PeritextClipboardData} from './types';

const toText = (buf: Uint8Array) => new TextDecoder().decode(buf);

const writeSync = (data: PeritextClipboardData<string>): boolean => {
  try {
    if (typeof document !== 'object') return false;
    const selection = window.getSelection();
    if (!selection) return false;
    const queryCommandSupported = document.queryCommandSupported;
    const copySupported = queryCommandSupported?.('copy') ?? true;
    const cutSupported = queryCommandSupported?.('cut') ?? true;
    if (!copySupported && !cutSupported) return false;
    const restoreSelection = saveSelection();
    const value = data['text/plain'] ?? '';
    const text = typeof value === 'string' ? value : '';
    const span = document.createElement('span');
    const style = span.style;
    style.whiteSpace = 'pre';
    style.userSelect = 'all';
    style.position = 'fixed';
    style.top = '-9999px';
    style.left = '-9999px';
    const listener = (event: ClipboardEvent) => {
      event.preventDefault();
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;
      for (const type in data) {
        const value = data[type];
        switch (type) {
          case 'text/plain':
          case 'text/html':
          case 'image/png': {
            clipboardData.setData(type, value);
            break;
          }
          default: {
            clipboardData.setData('web ' + type, value);
          }
        }
      }
    };
    span.addEventListener('copy', listener);
    span.addEventListener('cut', listener);
    try {
      document.body.appendChild(span);
      const select = () => {
        span.textContent = text;
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNode(span);
        selection.addRange(range);
      };
      select();
      document.execCommand('cut');
      select();
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      try {
        // span.removeEventListener('copy', listener);
        // span.removeEventListener('cut', listener);
        document.body.removeChild(span);
        restoreSelection?.();
      } catch {}
    }
  } catch {
    return false;
  }
};

export class DomClipboard implements PeritextClipboard {
  constructor(protected readonly clipboard: Clipboard) {}

  public writeText(text: string): undefined | Promise<void> {
    const success = writeSync({'text/plain': text});
    if (success) return;
    return this.clipboard.writeText(text);
  }

  public write(
    text: PeritextClipboardData<string>,
    binary?: PeritextClipboardData<Uint8Array>,
  ): undefined | Promise<void> {
    const success = writeSync(text);
    const binaryKeysLength = binary ? Object.keys(binary).length : 0;
    if (success && binaryKeysLength === 0) return;
    const clipboardData: Record<string, string | Blob> = {};
    const data = {
      ...binary,
      ...(!success ? text : {}),
    };
    for (const type in data) {
      switch (type) {
        case 'text/plain':
        case 'text/html':
        case 'image/png': {
          clipboardData[type] = new Blob([data[type] as BlobPart], {type});
          break;
        }
        default: {
          clipboardData['web ' + type] = new Blob([data[type] as BlobPart], {type});
        }
      }
    }
    const item = new ClipboardItem(clipboardData);
    const items: ClipboardItem[] = [item];
    return this.clipboard.write(items);
  }

  public async read<T extends string>(types: T[]): Promise<{[mime in T]: Uint8Array}> {
    const clipboard = this.clipboard;
    const items = await clipboard.read();
    const data = {} as {[mime in T]: Uint8Array};
    const promises: Promise<[type: T, value: Uint8Array]>[] = [];
    const item = items[0];
    for (const type of types) {
      if (item.types.includes(type))
        promises.push(
          item
            .getType(type)
            .then((blob) => blob.arrayBuffer())
            .then((value) => [type as T, new Uint8Array(value)]),
        );
    }
    const results = await Promise.all(promises);
    for (const [type, value] of results) data[type] = value;
    return data;
  }

  public async readData(): Promise<{text?: string; html?: string}> {
    const data: {text?: string; html?: string} = {};
    const {'text/plain': text, 'text/html': html} = await this.read(['text/plain', 'text/html']);
    if (!text && !html) return data;
    if (text) data.text = toText(text);
    if (html) data.html = toText(html);
    return data;
  }
}
