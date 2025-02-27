import type {PeritextClipboard, PeritextClipboardItem} from './types';

export class ClipboardFacade implements PeritextClipboard {
  constructor (protected readonly clipboard: Clipboard) {}

  public async writeText(text: string): Promise<void> {
    return await this.clipboard.writeText(text);
  }

  public async write(list: PeritextClipboardItem[]): Promise<void> {
    const items: ClipboardItem[] = [];
    for (const [mime, value] of list) {
      const item = new ClipboardItem({[mime]: value}, {presentationStyle: 'inline'});
      items.push(item);
    }
    return await this.clipboard.write(items);
  }
}
