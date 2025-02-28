import type {PeritextClipboard, PeritextClipboardData} from './types';

const writeSync = (data: PeritextClipboardData): boolean => {
  if (typeof document !== 'object') return false;
  const value = data['text/plain'] ?? '';
  const text = typeof value === 'string' ? value : '';
  const span = document.createElement('span');
  span.textContent = text;
  span.style.whiteSpace = 'pre';
  span.style.userSelect = 'all';
  const selection = window.getSelection();
  if (!selection) return false;
  let ranges = [];
  for (let i = 0; i < selection.rangeCount; i++)
    ranges.push(selection.getRangeAt(i));
  selection.removeAllRanges();
  try {
    document.body.appendChild(span);
    const range = document.createRange();
    range.selectNode(span);
    selection.addRange(range)
    document.execCommand('cut');
  } catch {
    return false;
  } finally {
    try {
      selection.removeAllRanges();
      document.body.removeChild(span);
      for (const range of ranges) selection.addRange(range);
    } catch {}
  }
  return true;
};

export class ClipboardFacade implements PeritextClipboard {
  constructor (protected readonly clipboard: Clipboard) {}

  public writeText(text: string): undefined | Promise<void> {
    const success = writeSync({'text/plain': text});
    if (success) return;
    return this.clipboard.writeText(text);
  }

  public write(data: PeritextClipboardData): undefined | Promise<void> {
    // const item = new ClipboardItem(data, {presentationStyle: 'inline'});
    const item = new ClipboardItem(data);
    const items: ClipboardItem[] = [item];
    return this.clipboard.write(items);
  }
}
