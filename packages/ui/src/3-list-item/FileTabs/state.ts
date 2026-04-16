import type * as React from 'react';
import * as rsync from '../../utils/rsync';
import {TabItem} from './types';

const enum Constants {
  MaxTabWidth = 200,
  MinTabWidth = 4,
}

const getTabId = (tab: TabItem) => tab.id ?? (tab.name + '');

const isTabDisabled = (tab: TabItem) => !!tab.disabled?.getSnapshot();

export interface DragState {
  key: string;
  startIndex: number;
  startX: number;
  currentX: number;
  currentIndex: number;
  pointerId: number;
}

export class FileTabsState {
  // ---------------------------------------------------- to be set by consumer
  public onNewTab: (() => (TabItem | undefined)) | undefined = void 0;
  public onDeleteTab: ((tab: TabItem, index: number) => void) | undefined = void 0;

  public readonly box: rsync.ElBox<HTMLElement>;
  public readonly tabsBox: rsync.ElBox<HTMLElement>;
  public readonly trailingBox: rsync.ElBox<HTMLElement>;
  public readonly tabWidth: rsync.ReactComputed<number>;
  public readonly selected: rsync.ReactValue<[id: TabItem, index: number] | null>;
  public readonly hovered: rsync.ReactValue<[id: string, index: number] | null> = rsync.val(null);
  public readonly drag: rsync.ReactValue<DragState | null> = rsync.val(null);
  public readonly frozenTabWidth: rsync.ReactValue<number | null> = rsync.val(null);
  public readonly exitingTabs: rsync.ReactValue<Array<{tab: TabItem; insertAt: number}>> = rsync.val([]);
  public readonly initialIds: ReadonlySet<string>;
  private readonly tabEls = new Map<string, HTMLElement>();
  private readonly tabRefCallbacks = new Map<string, (el: HTMLElement | null) => void>();
  private focusRaf = 0;
  
  constructor(
    public readonly tabs: rsync.ReactValue<TabItem[]>
  ) {
    const rawTabs = tabs.value;
    this.initialIds = new Set(rawTabs.map((t) => getTabId(t)));
    this.selected = rsync.val(rawTabs.length > 0 ? [rawTabs[0], 0] : null);
    this.box = new rsync.ElBox<HTMLElement>();
    this.tabsBox = new rsync.ElBox<HTMLElement>();
    this.trailingBox = new rsync.ElBox<HTMLElement>();
    this.tabWidth = rsync.comp([tabs, this.tabsBox, this.trailingBox, this.frozenTabWidth], ([tabs, [, , width], [, , trailingWidth], frozen]) => {
      if (frozen !== null) return frozen;
      const tabCount = tabs.length;
      if (!width || !tabCount) return Constants.MaxTabWidth;
      const available = Math.max(0, width - trailingWidth);
      const tabWidth = available / tabCount;
      return Math.max(Constants.MinTabWidth, Math.min(Constants.MaxTabWidth, tabWidth));
    });
  }

  public dispose() {
    this.box.dispose();
    this.tabsBox.dispose();
    this.trailingBox.dispose();
    this.dragEnd();
    this.cancelScheduledFocus();
    this.tabEls.clear();
    this.tabRefCallbacks.clear();
  }

  private selectedId(): string | null {
    const selected = this.selected.value;
    return selected ? getTabId(selected[0]) : null;
  }

  private selectedIndex(): number {
    const selectedId = this.selectedId();
    return selectedId ? this.tabs.value.findIndex((tab) => getTabId(tab) === selectedId) : -1;
  }

  public selectById(id: string | null) {
    if (!id) {
      this.selected.set(null);
      return;
    }
    const index = this.tabs.value.findIndex((tab) => getTabId(tab) === id);
    if (index < 0) {
      this.selected.set(null);
      return;
    }
    this.selected.set([this.tabs.value[index], index]);
  }

  private cancelScheduledFocus() {
    if (!this.focusRaf || typeof window === 'undefined') return;
    window.cancelAnimationFrame(this.focusRaf);
    this.focusRaf = 0;
  }

  public focusSelected() {
    const selectedId = this.selectedId();
    if (!selectedId) return;
    this.tabEls.get(selectedId)?.focus();
  }

  public scheduleFocusSelected() {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      this.focusSelected();
      return;
    }
    this.cancelScheduledFocus();
    this.focusRaf = window.requestAnimationFrame(() => {
      this.focusRaf = 0;
      this.focusSelected();
    });
  }

  public tabRef(id: string) {
    const existing = this.tabRefCallbacks.get(id);
    if (existing) return existing;
    const callback = (el: HTMLElement | null) => {
      if (el) this.tabEls.set(id, el);
      else {
        this.tabEls.delete(id);
        this.tabRefCallbacks.delete(id);
      }
    };
    this.tabRefCallbacks.set(id, callback);
    return callback;
  }

  public select(index: number) {
    const tab = this.tabs.value[index];
    if (!tab) return;
    const id = tab.id ?? tab.name;
    const selected = this.selected.value;
    if ((selected?.[0].id ?? selected?.[0].name) === id && selected?.[1] === index) return;
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
    const selectedId = this.selectedId();
    const shouldRefocus = selectedId === id;
    let nextSelectedId = selectedId;
    if (shouldRefocus) {
      const nextSelected = tabs[index + 1] ?? tabs[index - 1] ?? null;
      nextSelectedId = nextSelected ? getTabId(nextSelected) : null;
    }
    this.tabs.next([...tabs.slice(0, index), ...tabs.slice(index + 1)]);
    this.selectById(nextSelectedId);
    if (shouldRefocus && nextSelectedId) this.scheduleFocusSelected();
    const exiting = [...this.exitingTabs.value, {tab, insertAt: index}];
    exiting.sort((a, b) => a.insertAt - b.insertAt);
    this.exitingTabs.next(exiting);
    setTimeout(() => {
      this.exitingTabs.next(this.exitingTabs.value.filter((e) => (e.tab.id ?? e.tab.name) !== id));
    }, 250);
    this.onDeleteTab?.(tab, index);
  }

  public add(tab: TabItem) {
    this.unfreeze();
    const tabs = this.tabs.value;
    const newTabs = [...tabs, tab];
    this.tabs.next(newTabs);
    this.select(newTabs.length - 1);
    this.scheduleFocusSelected();
  }

  public reorder(startIndex: number, currentIndex: number): boolean {
    const tabs = this.tabs.value;
    const maxIndex = tabs.length - 1;
    if (startIndex < 0 || currentIndex < 0 || startIndex > maxIndex || currentIndex > maxIndex) return false;
    if (startIndex === currentIndex) return false;
    const nextTabs = [...tabs];
    const [removed] = nextTabs.splice(startIndex, 1);
    if (!removed) return false;
    nextTabs.splice(currentIndex, 0, removed);
    const selectedId = this.selectedId();
    this.tabs.next(nextTabs);
    this.selectById(selectedId);
    return true;
  }

  public readonly unfreeze = () => {
    this.frozenTabWidth.next(null);
  };

  public readonly addNew = () => {
    const item = this.onNewTab?.();
    if (!item) return;
    this.add(item);
  };

  private nextEnabledIndex(startIndex: number, direction: -1 | 1): number {
    const tabs = this.tabs.value;
    for (let index = startIndex + direction; index >= 0 && index < tabs.length; index += direction) {
      if (!isTabDisabled(tabs[index])) return index;
    }
    return -1;
  }

  private edgeEnabledIndex(direction: -1 | 1): number {
    const tabs = this.tabs.value;
    const startIndex = direction > 0 ? 0 : tabs.length - 1;
    for (let index = startIndex; index >= 0 && index < tabs.length; index += direction) {
      if (!isTabDisabled(tabs[index])) return index;
    }
    return -1;
  }

  public selectRelative(direction: -1 | 1): boolean {
    const currentIndex = this.selectedIndex();
    const startIndex = currentIndex >= 0 ? currentIndex : direction > 0 ? -1 : this.tabs.value.length;
    const nextIndex = this.nextEnabledIndex(startIndex, direction);
    if (nextIndex < 0) return false;
    this.select(nextIndex);
    this.scheduleFocusSelected();
    return true;
  }

  public selectEdge(direction: -1 | 1): boolean {
    const nextIndex = this.edgeEnabledIndex(direction);
    if (nextIndex < 0) return false;
    this.select(nextIndex);
    this.scheduleFocusSelected();
    return true;
  }

  public deleteSelected(): boolean {
    const index = this.selectedIndex();
    if (index < 0) return false;
    const item = this.tabs.value[index];
    if (!item || item.deletable === false) return false;
    this.delete(index);
    return true;
  }

  public reorderSelected(direction: -1 | 1): boolean {
    const currentIndex = this.selectedIndex();
    if (currentIndex < 0) return false;
    const nextIndex = Math.max(0, Math.min(this.tabs.value.length - 1, currentIndex + direction));
    if (nextIndex === currentIndex) return false;
    const reordered = this.reorder(currentIndex, nextIndex);
    if (reordered) this.scheduleFocusSelected();
    return reordered;
  }

  public readonly onKeyDown = (event: KeyboardEvent | React.KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented) return;
    const {key} = event;
    if (event.shiftKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      event.preventDefault();
      this.reorderSelected(key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if ((key === 'Delete' || key === 'Backspace') && event.shiftKey) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.selectRelative(-1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        this.selectRelative(1);
        return;
      case 'Home':
        event.preventDefault();
        this.selectEdge(1);
        return;
      case 'End':
        event.preventDefault();
        this.selectEdge(-1);
        return;
      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        this.deleteSelected();
        this.unfreeze();
        return;
    }
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
    this.reorder(d.startIndex, d.currentIndex);
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
