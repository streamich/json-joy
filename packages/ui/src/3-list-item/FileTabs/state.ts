import * as rsync from '../../utils/rsync';
import {TabItem} from './types';

const enum Constants {
  MaxTabWidth = 200,
  MinTabWidth = 32,
}

export class FileTabsState {
  public readonly box: rsync.ElBox<HTMLElement>;
  public readonly tabWidth: rsync.ReactComputed<number>;
  public readonly selected: rsync.ReactValue<string>;
  public readonly hovered: rsync.ReactValue<[id: string, index: number] | null> = rsync.val(null);
  
  constructor(
    public readonly tabs: rsync.ReactValue<TabItem[]>
  ) {
    const rawTabs = tabs.value;
    this.selected = rsync.val(rawTabs[0].id ?? rawTabs[0].name ?? '');
    this.box = new rsync.ElBox<HTMLElement>();
    this.tabWidth = rsync.comp([tabs, this.box], ([tabs, [, , width]]) => {
      if (!width) return Constants.MaxTabWidth;
      const tabCount = tabs.length;
      const tabWidth = width / tabCount;
      return Math.max(Constants.MinTabWidth, Math.min(Constants.MaxTabWidth, tabWidth));
    });
  }

  public dispose() {
    this.box.dispose();
  }
}
