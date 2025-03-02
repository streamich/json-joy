import type {PeritextClipboard, PeritextClipboardData} from './types';

const writeSync = (data: PeritextClipboardData<string>): boolean => {
  if (typeof document !== 'object') return false;
  const selection = window.getSelection();
  if (!selection) return false;
  const copySupported = document.queryCommandSupported?.('copy') ?? true;
  const cutSupported = document.queryCommandSupported?.('cut') ?? true;
  if (!copySupported && !cutSupported) return false;
  const ranges = [];
  for (let i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i));
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
      selection.removeAllRanges();
      for (const range of ranges) selection.addRange(range);
    } catch {}
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
          clipboardData[type] = new Blob([data[type]], {type});
          break;
        }
        default: {
          clipboardData['web ' + type] = new Blob([data[type]], {type});
        }
      }
    }
    const item = new ClipboardItem(clipboardData);
    const items: ClipboardItem[] = [item];
    return this.clipboard.write(items);
  }
}
