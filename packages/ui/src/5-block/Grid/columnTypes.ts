import type {GridAlign, GridColumnType} from './types';

/**
 * The non-visual half of a column type: default comparator and alignment. The
 * matching default cell renderers live in the view layer (`components/GridCell`),
 * keeping the headless state React-free. Comparators never see nullish values —
 * the row pipeline sinks those to the bottom before comparing.
 */
export interface GridColumnTypeSpec {
  align: GridAlign;
  compare: (a: any, b: any) => number;
}

/** Coerce a `date` cell value (`Date`, epoch ms, or parseable string) to epoch ms. */
export const toTime = (value: unknown): number =>
  value instanceof Date ? value.getTime() : new Date(value as string | number).getTime();

const registry: Record<GridColumnType, GridColumnTypeSpec> = {
  text: {
    align: 'left',
    compare: (a, b) => String(a).localeCompare(String(b)),
  },
  number: {
    align: 'right',
    compare: (a, b) => (a < b ? -1 : a > b ? 1 : 0),
  },
  bool: {
    align: 'center',
    compare: (a, b) => (a === b ? 0 : a ? 1 : -1),
  },
  date: {
    align: 'left',
    compare: (a, b) => toTime(a) - toTime(b),
  },
};

export const columnType = (type: GridColumnType | undefined): GridColumnTypeSpec => registry[type ?? 'text'];
