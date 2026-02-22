import * as React from 'react';
import {BehaviorSubject} from 'rxjs';
import type {MenuItem} from '../../StructuralMenu/types';
import {findMenuItems} from './util';
import type {SearchMatch} from './types';
import type {ContextMenuProps} from '.';

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
        const matches = findMenuItems(this.root, query);
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
      this.onclose?.();
    }
  };
}
