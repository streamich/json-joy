import {formatJsonPointer, get, parseJsonPointer} from '@jsonjoy.com/json-pointer';
import * as React from 'react';

/**
 * Context that lets any node inside a {@link ClickableJson} tree *isolate* itself
 * — collapse the whole view down to just that node (rendered as a fresh root)
 * with a breadcrumb trail back to the document root. Published by `ClickableJson`;
 * consumed by node hover regions (double-click) and their toolbars ("Isolate").
 */
export interface IsolationContextValue {
  /**
   * Isolate the node at the given absolute JSON Pointer (relative to the root
   * document). Passing `''` (the root pointer) clears isolation, restoring the
   * full document. `undefined` when isolation is disabled (the component was given
   * neither the `isolatable` flag nor a controlled `isolation` prop) — nodes then
   * skip the double-click handler and the "Isolate" toolbar action.
   */
  isolate?: (pointer: string) => void;

  /**
   * Absolute JSON Pointer of the node that is *currently* isolated, or `null` when
   * the full document is shown.
   */
  isolated: string | null;
}

export const isolationContext = React.createContext<IsolationContextValue>({isolated: null});
export const useIsolation = (): IsolationContextValue => React.useContext(isolationContext);

/** A node along an isolated path, used to render one breadcrumb. */
export interface Crumb {
  /** Absolute JSON Pointer of the node (relative to the root document). */
  pointer: string;
  /** Short, human-friendly label: an object key, an array index, or the root marker. */
  label: string;
}

export const getValueAt = (root: unknown, pointer: string): {found: boolean; value: unknown} => {
  if (!pointer) return {found: true, value: root};
  const value = get(root, parseJsonPointer(pointer));
  return {found: value !== undefined, value};
};

const rootLabel = (root: unknown): string =>
  Array.isArray(root) ? '[ ]' : root && typeof root === 'object' ? '{ }' : 'root';

export const buildCrumbs = (root: unknown, pointer: string): Crumb[] => {
  const crumbs: Crumb[] = [{pointer: '', label: rootLabel(root)}];
  const path = parseJsonPointer(pointer);
  for (let i = 1; i <= path.length; i++)
    crumbs.push({pointer: formatJsonPointer(path.slice(0, i)), label: String(path[i - 1])});
  return crumbs;
};
