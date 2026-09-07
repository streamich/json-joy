import {formatJsonPointer, get, parseJsonPointer} from '@jsonjoy.com/json-pointer';
import type {SchemaBase} from '@jsonjoy.com/json-type';
import * as React from 'react';

/**
 * Context that lets any node inside a {@link ClickableType} tree *isolate* itself
 * — collapse the whole view down to just that node (rendered as a fresh root)
 * with a breadcrumb trail back to the true root. Published by `ClickableType`;
 * consumed by node hover regions (double-click) and their toolbars ("Isolate").
 */
export interface IsolationContextValue {
  /**
   * Isolate the node at the given absolute JSON Pointer (relative to the true
   * root schema). Passing `''` (the root pointer) clears isolation, restoring
   * the full tree.
   */
  isolate: (pointer: string) => void;
}

export const isolationContext = React.createContext<IsolationContextValue>({isolate: () => {}});
export const useIsolation = (): IsolationContextValue => React.useContext(isolationContext);

/** A node along an isolated path, used to render one breadcrumb. */
export interface Crumb {
  /** Absolute JSON Pointer of the node (relative to the root schema). */
  pointer: string;
  /** The resolved schema node at {@link pointer}. */
  schema: SchemaBase;
}

const isNode = (value: unknown): value is SchemaBase =>
  !!value && typeof value === 'object' && typeof (value as {kind?: unknown}).kind === 'string';

/**
 * Resolve the schema node at an absolute JSON Pointer (standard form: `''` is the
 * root, deeper nodes carry a leading slash, e.g. `/keys/0/value`). Returns
 * `undefined` when the pointer doesn't resolve to a schema node — e.g. a
 * stale/invalid controlled `isolation` prop.
 */
export const getSchemaAt = (root: SchemaBase, pointer: string): SchemaBase | undefined => {
  const value = get(root, parseJsonPointer(pointer));
  return isNode(value) ? value : undefined;
};

/**
 * Walk an absolute pointer from the root, emitting one {@link Crumb} for every
 * schema node along the way (including the root and the isolated node itself).
 * Structural segments that aren't nodes (`keys`, `head`, …, array indices'
 * container arrays) are skipped — only the nodes they wrap become crumbs, which
 * is exactly the set of isolatable pointers.
 */
export const buildCrumbs = (root: SchemaBase, pointer: string): Crumb[] => {
  const crumbs: Crumb[] = [];
  if (isNode(root)) crumbs.push({pointer: '', schema: root});
  const path = parseJsonPointer(pointer);
  for (let i = 1; i <= path.length; i++) {
    const prefix = path.slice(0, i);
    const value = get(root, prefix);
    if (isNode(value)) crumbs.push({pointer: formatJsonPointer(prefix), schema: value});
  }
  return crumbs;
};

/** Short, human-friendly label for a breadcrumb: a key's name, else a title, else the kind. */
export const crumbLabel = (schema: SchemaBase): string => {
  const s = schema as SchemaBase & {key?: string; title?: string};
  if (schema.kind === 'key') return s.key ?? 'key';
  return s.title || schema.kind;
};
