import type {PeritextClipboard, PeritextClipboardData} from './types';

export class ClipboardFacade implements PeritextClipboard {
  constructor (protected readonly clipboard: Clipboard) {}

  public async writeText(text: string): Promise<void> {
    return await this.clipboard.writeText(text);
  }

  public async write(data: PeritextClipboardData): Promise<void> {
    // const item = new ClipboardItem(data, {presentationStyle: 'inline'});
    const item = new ClipboardItem(data);
    const items: ClipboardItem[] = [item];
    console.log(items);
    return await this.clipboard.write(items);
  }
}
