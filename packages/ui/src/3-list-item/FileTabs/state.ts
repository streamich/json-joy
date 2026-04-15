import * as rsync from '../../utils/rsync';
import {TabItem} from './types';

const enum Constants {
  MaxTabWidth = 200,
  MinTabWidth = 32,
  HorizontalPadding = 16,
  AddButtonWidth = 32,
}

export interface DragState {
  key: string;
  startIndex: number;
  startX: number;
  currentX: number;
  currentIndex: number;
  pointerId: number;
}

export class FileTabsState {
  public readonly box: rsync.ElBox<HTMLElement>;
  public readonly tabWidth: rsync.ReactComputed<number>;
  public readonly selected: rsync.ReactValue<[id: TabItem, index: number] | null>;
  public readonly hovered: rsync.ReactValue<[id: string, index: number] | null> = rsync.val(null);
  public readonly drag: rsync.ReactValue<DragState | null> = rsync.val(null);
  public readonly frozenTabWidth: rsync.ReactValue<number | null> = rsync.val(null);
  public readonly exitingTabs: rsync.ReactValue<Array<{tab: TabItem; insertAt: number}>> = rsync.val([]);
  public readonly initialIds: ReadonlySet<string>;
  public addNewTab: (() => TabItem | undefined) | undefined = void 0;
  
  constructor(
    public readonly tabs: rsync.ReactValue<TabItem[]>
  ) {
    const rawTabs = tabs.value;
    this.initialIds = new Set(rawTabs.map((t) => t.id ?? t.name));
    this.selected = rsync.val(rawTabs.length > 0 ? [rawTabs[0], 0] : null);
    this.box = new rsync.ElBox<HTMLElement>();
    this.tabWidth = rsync.comp([tabs, this.box, this.frozenTabWidth], ([tabs, [, , width], frozen]) => {
      if (frozen !== null) return frozen;
      if (!width) return Constants.MaxTabWidth;
      const tabCount = tabs.length;
      const available = width - Constants.HorizontalPadding - Constants.AddButtonWidth;
      const tabWidth = available / tabCount;
      return Math.max(Constants.MinTabWidth, Math.min(Constants.MaxTabWidth, tabWidth));
    });
  }

  public dispose() {
    this.box.dispose();
    this.dragEnd();
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
    this.frozenTabWidth.next(this.tabWidth.value);
    const selected = this.selected.value;
    if ((selected?.[0].id ?? selected?.[0].name) === id) {
      const nextSelected = tabs[index + 1] ?? tabs[index - 1] ?? null;
      this.selected.set(nextSelected ? [nextSelected, index] : null);
    }
    this.tabs.next([...tabs.slice(0, index), ...tabs.slice(index + 1)]);
    const exiting = [...this.exitingTabs.value, {tab, insertAt: index}];
    exiting.sort((a, b) => a.insertAt - b.insertAt);
    this.exitingTabs.next(exiting);
    setTimeout(() => {
      this.exitingTabs.next(this.exitingTabs.value.filter((e) => (e.tab.id ?? e.tab.name) !== id));
    }, 250);
  }

  public add(tab: TabItem) {
    this.frozenTabWidth.next(null);
    const tabs = this.tabs.value;
    const newTabs = [...tabs, tab];
    this.tabs.next(newTabs);
    this.select(newTabs.length - 1);
  }

  public readonly unfreeze = () => {
    this.frozenTabWidth.next(null);
  };

  public readonly addNew = () => {
    const item = this.addNewTab?.();
    if (!item) return;
    this.add(item);
  };

  // ----------------------------------------------------------- dragging logic

  public readonly dragStart = (key: string, index: number, clientX: number, pointerId: number) => {
    this.drag.next({key, startIndex: index, startX: clientX, currentX: clientX, currentIndex: index, pointerId});
    window.addEventListener('pointermove', this._onDragMove);
    window.addEventListener('pointerup', this._onDragEnd);
  };

  private readonly _onDragMove = (e: PointerEvent) => {
    const d = this.drag.value;
    if (!d || e.pointerId !== d.pointerId) return;
    const tabWidth = this.tabWidth.value;
    const maxIndex = this.tabs.value.length - 1;
    // Clamp clientX so the ghost cannot travel beyond the first or last tab position.
    const minX = d.startX - d.startIndex * tabWidth;
    const maxX = d.startX + (maxIndex - d.startIndex) * tabWidth;
    const clampedX = Math.max(minX, Math.min(maxX, e.clientX));
    const delta = clampedX - d.startX;
    const newIndex = Math.max(0, Math.min(maxIndex, d.startIndex + Math.round(delta / tabWidth)));
    this.drag.next({...d, currentX: clampedX, currentIndex: newIndex});
  };

  private readonly _onDragEnd = (e: PointerEvent) => {
    const d = this.drag.value;
    if (!d || e.pointerId !== d.pointerId) return;
    window.removeEventListener('pointermove', this._onDragMove);
    window.removeEventListener('pointerup', this._onDragEnd);
    if (d.currentIndex !== d.startIndex) {
      const tabs = [...this.tabs.value];
      const [removed] = tabs.splice(d.startIndex, 1);
      tabs.splice(d.currentIndex, 0, removed);
      this.tabs.next(tabs);
      // Fix selected index after reorder
      const sel = this.selected.value;
      if (sel) {
        const selId = sel[0].id ?? sel[0].name;
        const newIdx = tabs.findIndex((t) => (t.id ?? t.name) === selId);
        if (newIdx >= 0) this.selected.next([sel[0], newIdx]);
      }
    }
    this.drag.next(null);
  };

  public dragEnd() {
    window.removeEventListener('pointermove', this._onDragMove);
    window.removeEventListener('pointerup', this._onDragEnd);
    this.drag.next(null);
  }

  public dragOffset(index: number): number {
    const d = this.drag.value;
    if (!d) return 0;
    const {startIndex, currentIndex} = d;
    if (index === startIndex) return 0;
    const tabWidth = this.tabWidth.value;
    if (startIndex < currentIndex && index > startIndex && index <= currentIndex) return -tabWidth;
    if (startIndex > currentIndex && index < startIndex && index >= currentIndex) return tabWidth;
    return 0;
  }
}
