import type {SchemaBase} from '@jsonjoy.com/json-type';
import * as React from 'react';

/**
 * Context shared by all nodes of a single {@link ClickableType} tree. Mirrors
 * the `ClickableJson` context: it carries the root JSON Pointer prefix and a
 * `render` callback used for recursion (the callback indirection lets the
 * per-kind components recurse without statically importing `TypeNode`, avoiding
 * an import cycle).
 */
export interface ClickableTypeContextValue {
  /** JSON Pointer prefix of the root schema. Prepended to every node pointer. */
  pfx: string;

  /**
   * Number of nesting levels expanded by default. Nodes deeper than this start
   * collapsed (their children hidden until clicked). `Infinity` expands all.
   */
  expand: number;

  /**
   * Whether to render the collapse/expand triangles. When `false`, nodes are
   * still collapsible by clicking their kind chip — just without the triangle.
   */
  toggles: boolean;

  /**
   * Recursively render a child schema node at the given JSON Pointer (relative
   * to the root, i.e. without {@link pfx}).
   */
  render: (schema: SchemaBase, pointer: string) => React.ReactNode;

  /**
   * Broadcasts "expand/collapse all" commands across the tree (see
   * {@link useExpandAll}). A node's toolbar `emit`s its own pointer; every
   * collapsible at or under that pointer reacts.
   */
  expansion: ExpansionBus;
}

/** Fired with the target JSON Pointer and whether to open (expand) or close. */
export type ExpansionListener = (target: string, open: boolean) => void;

export interface ExpansionBus {
  emit: (target: string, open: boolean) => void;
  subscribe: (listener: ExpansionListener) => () => void;
}

/** Create a fresh expansion bus (one per {@link ClickableType} tree). */
export const createExpansionBus = (): ExpansionBus => {
  const listeners = new Set<ExpansionListener>();
  return {
    emit: (target, open) => {
      for (const fn of listeners) fn(target, open);
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
};

export const context = React.createContext<ClickableTypeContextValue>(null!);
export const useType = () => React.useContext(context);

/** Whether `pointer` is at or under `target` (matched on pointer-segment boundaries). */
const isUnder = (pointer: string, target: string): boolean =>
  pointer === target || pointer.startsWith(target + '/') || target === '';

/**
 * Subscribe a collapsible to "expand/collapse all" commands: `apply(open)` is
 * called whenever a command targets this `pointer` or one of its ancestors.
 */
export const useExpandAll = (pointer: string, apply: (open: boolean) => void): void => {
  const {expansion} = useType();
  const ref = React.useRef({pointer, apply});
  ref.current = {pointer, apply};
  React.useEffect(
    () =>
      expansion.subscribe((target, open) => {
        if (isUnder(ref.current.pointer, target)) ref.current.apply(open);
      }),
    [expansion],
  );
};

/**
 * Nesting depth of the current node (root = 0). Each composite type increments
 * it for its children via {@link TypeLayout}, so a node can decide whether to
 * start collapsed based on its depth and the configured {@link ClickableTypeContextValue.expand} level.
 */
export const depthContext = React.createContext(0);
export const useDepth = () => React.useContext(depthContext);

/**
 * When `true`, the current node hides its own collapse triangle (it can still be
 * toggled by clicking its kind chip). Set by {@link TypeObj} for a key's
 * immediate value, where a left-gutter triangle would overlap the key name; it
 * is reset to `false` for that value's own descendants.
 */
export const hideToggleContext = React.createContext(false);
export const useHideToggle = () => React.useContext(hideToggleContext);

/**
 * JSON Pointer of the nearest enclosing node, published by {@link TypeHoverable}.
 * Lets sub-parts that aren't schema nodes themselves (e.g. examples) derive
 * their own pointer (`.../examples/0`) so they can be made hoverable too.
 */
export const pointerContext = React.createContext('');
export const usePointer = () => React.useContext(pointerContext);

/**
 * When `true`, the next {@link TypeNode} renders its body without its own
 * hoverable wrapper — used by labeled rows ({@link ChildRow}) that provide a
 * single row-level hoverable around `label: value`, so the value doesn't add a
 * second (overlapping) region. Reset to `false` for that value's descendants.
 */
export const bareContext = React.createContext(false);
