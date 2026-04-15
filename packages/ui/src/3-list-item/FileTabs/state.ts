import * as rsync from '../../utils/rsync';
import {TabItem} from './types';

const enum Constants {
  MaxTabWidth = 200,
  MinTabWidth = 32,
}

export class FileTabsState {
  public readonly box: rsync.ElBox<HTMLElement>;
  public readonly tabWidth: rsync.ReactComputed<number>;
  public readonly selected: rsync.ReactValue<[id: TabItem, index: number] | null>;
  public readonly hovered: rsync.ReactValue<[id: string, index: number] | null> = rsync.val(null);
  public addNewTab: (() => TabItem | undefined) | undefined = void 0;
  
  constructor(
    public readonly tabs: rsync.ReactValue<TabItem[]>
  ) {
    const rawTabs = tabs.value;
    this.selected = rsync.val(rawTabs.length > 0 ? [rawTabs[0], 0] : null);
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

  public select(index: number) {
    const tab = this.tabs.value[index];
    const id = tab.id ?? tab.name;
    const selected = this.selected.value;
    if ((selected?.[0].id ?? selected?.[0].name) === id) return;
    this.selected.set([tab, index]);
    this.hovered.set(null);
  }

  public delete (index: number) {
    const tabs = this.tabs.value;
    const tab = tabs[index];
    if (!tab) return;
    const id = tab.id ?? tab.name;
    this.hovered.set(null);
    const newTabs = [...tabs.slice(0, index), ...tabs.slice(index + 1)];
    const selected = this.selected.value;
    if ((selected?.[0].id ?? selected?.[0].name) === id) {
      const nextSelected = tabs[index + 1] ?? tabs[index - 1] ?? null;
      this.selected.set(nextSelected ? [nextSelected, index] : null);
    }
    this.tabs.next(newTabs);
  }

  public add(tab: TabItem) {
    const tabs = this.tabs.value;
    const newTabs = [...tabs, tab];
    this.tabs.next(newTabs);
    this.select(newTabs.length - 1);
  }

  public readonly addNew = () => {
    const item = this.addNewTab?.();
    if (!item) return;
    this.add(item);
  };
}
