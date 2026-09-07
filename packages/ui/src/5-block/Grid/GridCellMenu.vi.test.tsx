// @vitest-environment jsdom
import * as React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Provider as StylesProvider} from '../../styles/context';
import {Grid} from './Grid';
import {GridState} from './state';
import type {GridColumnDef} from './types';

// jsdom has neither matchMedia (probed at module load) nor ResizeObserver
// (ScrollArea observes the viewport).
vi.hoisted(() => {
  if (typeof window !== 'undefined' && !window.matchMedia) {
    (window as any).matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  }
  if (typeof globalThis.ResizeObserver === 'undefined') {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

interface Item {
  name: string;
  size: number;
}

const data: Item[] = [
  {name: 'alpha', size: 1},
  {name: 'bravo', size: 2},
  {name: 'charlie', size: 3},
];

const columns: GridColumnDef<Item>[] = [
  {id: 'name', header: 'Name'},
  {id: 'size', header: 'Size', type: 'number'},
];

describe('GridCellMenu (jsdom)', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    React.act(() => root.unmount());
    host.remove();
  });

  const pill = () => document.querySelector('[data-grid-cellmenu]');
  const pillButtons = () => Array.from(document.querySelectorAll('[data-grid-cellmenu] button'));
  const click = (el: Element) =>
    React.act(() => {
      el.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
      el.dispatchEvent(new MouseEvent('pointerup', {bubbles: true}));
      el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

  it('dismisses when the action also sets parent React state (the story shape)', () => {
    const state = new GridState<Item>({data, columns, getId: (item) => item.name});
    const lastSeen: string[] = [];
    const Story: React.FC = () => {
      const [last, setLast] = React.useState('none yet');
      lastSeen.push(last);
      return (
        <StylesProvider>
          <Grid<Item>
            state={state}
            data={data}
            columns={columns}
            getId={(item) => item.name}
            cellMenu={(_cell, _column, row) => [
              {name: 'Comment', icon: () => 'c', onSelect: () => setLast(`Comment on ${row.id}`)},
            ]}
          />
        </StylesProvider>
      );
    };
    React.act(() => root.render(<Story />));
    React.act(() => state.setHoverCell({row: 'bravo', col: 'name'}));
    expect(pill()).not.toBe(null);
    click(pillButtons()[0]);
    expect(lastSeen.at(-1)).toBe('Comment on bravo');
    expect(state.hoverCell$.value).toBe(null);
    expect(pill()).toBe(null);
  });

  it('renders the pill for the hovered cell and dismisses it when an action fires', () => {
    const state = new GridState<Item>({data, columns, getId: (item) => item.name});
    const onComment = vi.fn();
    const onOpen = vi.fn();
    React.act(() => {
      root.render(
        <StylesProvider>
          <Grid<Item>
            state={state}
            data={data}
            columns={columns}
            getId={(item) => item.name}
            cellMenu={(_cell, column, row) =>
              column.id !== 'name'
                ? []
                : [
                    {name: 'Open', keepOpen: true, icon: () => 'o', onSelect: () => onOpen(row.id)},
                    {name: 'Comment', icon: () => 'c', onSelect: () => onComment(row.id)},
                  ]
            }
          />
        </StylesProvider>,
      );
    });
    expect(pill()).toBe(null);

    React.act(() => state.setHoverCell({row: 'bravo', col: 'name'}));
    expect(pill()).not.toBe(null);
    expect(pillButtons().length).toBe(2);

    // `keepOpen` action: fires, the pill stays.
    click(pillButtons()[0]);
    expect(onOpen).toHaveBeenCalledWith('bravo');
    expect(state.hoverCell$.value).toEqual({row: 'bravo', col: 'name'});
    expect(pill()).not.toBe(null);

    // Default action: fires and dismisses the pill.
    click(pillButtons()[1]);
    expect(onComment).toHaveBeenCalledWith('bravo');
    expect(state.hoverCell$.value).toBe(null);
    expect(pill()).toBe(null);

    // Chrome retargets the post-unmount pointerover to the pill's parent —
    // the ROW element — before the real hit-test reaches the cell; neither
    // may bring the pill back.
    const rowEl = cellTarget(state, 'bravo').parentElement as Element;
    React.act(() => state.onCellsPointerOver({pointerType: 'mouse', target: rowEl} as any));
    expect(pill()).toBe(null);

    // Suppressed: re-hovering the same cell does not bring the pill back...
    React.act(() => state.onCellsPointerOver({pointerType: 'mouse', target: cellTarget(state, 'bravo')} as any));
    expect(pill()).toBe(null);
    // ...but another cell does.
    React.act(() => state.onCellsPointerOver({pointerType: 'mouse', target: cellTarget(state, 'alpha')} as any));
    expect(state.hoverCell$.value).toEqual({row: 'alpha', col: 'name'});
    expect(pill()).not.toBe(null);
  });
});

/** The rendered name-column cell of a row, as a `pointerover` target. */
const cellTarget = (state: GridState<Item>, rowId: string): Element => {
  const el = state.cellElement({row: rowId, col: 'name'});
  if (!el) throw new Error(`cell ${rowId}/name not rendered`);
  return el;
};
