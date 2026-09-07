import * as React from 'react';
import {BehaviorSubject} from 'rxjs';
import {findMenuItems} from './util';
import {rsync} from '../../..';
import type {MenuItem} from '../../StructuralMenu/types';
import type {SearchMatch} from './types';
import type {ContextMenuProps} from '.';
import type {OpenPanelState} from './OpenPanelState';

const FOCUSABLE = [
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="menuitemcheckbox"]:not([aria-disabled="true"])',
  '[role="menuitemradio"]:not([aria-disabled="true"])',
  'button:not(:disabled):not([aria-disabled="true"])',
  'input:not(:disabled)',
  'select:not(:disabled)',
  '[tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])',
].join(',');

interface FocusRow {
  el: HTMLElement;
  stops: HTMLElement[];
}

const getRows = (container: HTMLElement): FocusRow[] => {
  const rowEls = container.querySelectorAll<HTMLElement>('[data-menu-row]');
  return Array.from(rowEls)
    .map((el) => ({
      el,
      stops: Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)),
    }))
    .filter((r) => r.stops.length > 0);
};

const findPosition = (rows: FocusRow[]): {row: number; col: number} => {
  const focused = document.activeElement;
  for (let ri = 0; ri < rows.length; ri++) {
    for (let ci = 0; ci < rows[ri].stops.length; ci++) {
      const stop = rows[ri].stops[ci];
      if (stop === focused || stop.contains(focused as Node)) return {row: ri, col: ci};
    }
  }
  return {row: 0, col: 0};
};

export class ContextMenuState {
  public static readonly create = (props: ContextMenuProps) => {
    return new ContextMenuState(props.menu, props);
  };

  public readonly minWidth = 220;
  public readonly path$: BehaviorSubject<MenuItem[]> = new BehaviorSubject<MenuItem[]>([]);
  public readonly menu$: BehaviorSubject<MenuItem>;

  /** Search text. */
  public readonly search$ = new BehaviorSubject<string>('');
  public readonly matches$ = new BehaviorSubject<SearchMatch[]>([]);

  public onclose?: () => void;

  constructor(
    public readonly root: MenuItem,
    public props: ContextMenuProps,
  ) {
    this.menu$ = new BehaviorSubject<MenuItem>(root);
    this.search$.subscribe((query) => {
      if (!query) this.matches$.next([]);
      else {
        const includeContainers = !!this.props?.searchIncludeContainers;
        const matches = findMenuItems(this.root, query, {includeContainers});
        this.matches$.next(matches);
      }
    });
  }

  public select(path: MenuItem[], menu: MenuItem) {
    this.path$.next(path);
    this.menu$.next(menu);
    this.search$.next('');
  }

  public readonly selectNone = (): void => {
    this.path$.next([]);
    this.menu$.next(this.root);
    this.search$.next('');
    return;
  };

  public readonly selectInPath = (pathIndex: number): void => {
    if (pathIndex === 0) return this.selectNone();
    const path = this.path$.getValue();
    const item = path[pathIndex];
    if (!item) return this.selectNone();
    this.path$.next(path.slice(0, pathIndex));
    this.menu$.next(item);
    this.search$.next('');
  };

  public readonly selectBack = (): void => {
    const path$ = this.path$;
    const path = path$.getValue();
    if (path.length <= 1) return this.selectNone();
    const item = path.pop()!;
    this.path$.next(path);
    this.menu$.next(item);
    this.search$.next('');
  };

  public execute = (item: MenuItem, event: React.MouseEvent): void => {
    if (item.onSelect) {
      item.onSelect(event);
      if (!item.keepOpen) this.onclose?.();
    }
  };

  // ------------------------------------------------------ Argument collection

  /** The item currently being configured with arguments. */
  public readonly argsItem = rsync.val<MenuItem | null>(null);

  public readonly selectArgs = (path: MenuItem[], item: MenuItem): void => {
    this.path$.next(path);
    this.argsItem.next(item);
  };

  public readonly cancelArgs = (): void => {
    this.argsItem.next(null);
  };

  // ------------------------------------------------------ Keyboard navigation

  private _lastCol = 0;

  public focusFirstItem(container: HTMLElement | null, showSearch?: boolean, depth?: number): void {
    if (!container) return;
    if (showSearch && !depth) {
      const input = container.querySelector<HTMLInputElement>('input:not(:disabled)');
      if (input) input.focus();
      return;
    }
    const rows = getRows(container);
    if (rows.length) rows[0].stops[0]?.focus();
  }

  /**
   * Keyboard handler for a context menu pane. Call from the pane's `onKeyDown`.
   */
  public handleKeyDown(
    e: React.KeyboardEvent,
    container: HTMLElement | null,
    openPanel: OpenPanelState,
    depth: number,
    onEsc?: () => void,
  ): void {
    if (!container) return;
    const rows = getRows(container);
    // Escape works even without focusable rows.
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (openPanel.deselect()) return;
      if (this.path$.getValue().length > 0) {
        this.selectBack();
        return;
      }
      (onEsc ?? this.onclose)?.();
      return;
    }
    if (!rows.length) return;
    const {row, col} = findPosition(rows);
    const focusCell = (r: number, c: number) => {
      this._lastCol = c;
      rows[r]?.stops[c]?.focus();
    };
    // Let inputs handle their own horizontal/caret navigation.
    const activeTag = (document.activeElement as HTMLElement)?.tagName;
    const isTextInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        e.stopPropagation();
        const next = (row + 1) % rows.length;
        const nextCol = Math.min(this._lastCol, rows[next].stops.length - 1);
        focusCell(next, nextCol);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        e.stopPropagation();
        const prev = (row - 1 + rows.length) % rows.length;
        const prevCol = Math.min(this._lastCol, rows[prev].stops.length - 1);
        focusCell(prev, prevCol);
        break;
      }
      case 'ArrowRight': {
        if (isTextInput) break;
        e.preventDefault();
        e.stopPropagation();
        const currentRow = rows[row];
        if (currentRow.stops.length > 1 && col < currentRow.stops.length - 1) {
          focusCell(row, col + 1);
        } else {
          // Open child popup if the row has one (single-stop items or last
          // stop in multi-stop rows like ContextMenuToolbarRow).
          const menuId = currentRow.el.getAttribute('data-menu-id');
          if (menuId) openPanel.forceSelect(menuId);
        }
        break;
      }
      case 'ArrowLeft': {
        if (isTextInput) break;
        if (!depth && this.search$.getValue()) break;
        e.preventDefault();
        e.stopPropagation();
        const currentRow = rows[row];
        if (currentRow.stops.length > 1 && col > 0) {
          focusCell(row, col - 1);
        } else if (depth > 0) {
          if (!openPanel.deselect()) onEsc?.();
        } else {
          this.selectBack();
        }
        break;
      }
      case 'Home': {
        if (isTextInput) break;
        e.preventDefault();
        e.stopPropagation();
        focusCell(0, 0);
        break;
      }
      case 'End': {
        if (isTextInput) break;
        e.preventDefault();
        e.stopPropagation();
        focusCell(rows.length - 1, 0);
        break;
      }
      case 'Tab': {
        e.preventDefault();
        e.stopPropagation();
        const allStops = rows.flatMap((r) => r.stops);
        const currentEl = document.activeElement as HTMLElement;
        const currentIdx = allStops.indexOf(currentEl);
        const next = e.shiftKey
          ? (currentIdx - 1 + allStops.length) % allStops.length
          : (currentIdx + 1) % allStops.length;
        allStops[next]?.focus();
        for (let ri = 0; ri < rows.length; ri++) {
          const ci = rows[ri].stops.indexOf(allStops[next]);
          if (ci !== -1) {
            this._lastCol = ci;
            break;
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') break;
        e.preventDefault();
        e.stopPropagation();
        rows[row]?.stops[col]?.click();
        break;
      }
    }
  }

  /**
   * Focus-out handler for the root pane. Closes the menu when focus leaves
   * the entire menu tree (including portal-rendered submenus).
   */
  public handleFocusOut(e: React.FocusEvent, container: HTMLElement | null, depth: number, onEsc?: () => void): void {
    if (depth !== 0 || !container || !onEsc) return;
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    if (relatedTarget && container.contains(relatedTarget)) return;
    setTimeout(() => {
      const active = document.activeElement;
      if (active && container.contains(active)) return;
      // Check if focus moved to a portal-rendered submenu.
      if (active instanceof HTMLElement && active.closest('[role="menu"]')) return;
      onEsc();
    }, 0);
  }
}
