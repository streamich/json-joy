import * as React from 'react';
import type {OnChange} from './types';

/** Which inline editor of a node an {@link EditBus} command targets. */
export type EditTarget =
  | 'insert' // open the insert editor of the object/array at the pointer
  | 'key' // focus the property-name input of the node at the pointer
  | 'value'; // focus the value input of the node at the pointer

/** Fired with the JSON Pointer of the node and the editor to activate. */
export type EditListener = (pointer: string, target: EditTarget) => void;

/**
 * Broadcasts "activate this inline editor" commands across a single
 * {@link ClickableJson} tree.
 */
export interface EditBus {
  emit: (pointer: string, target: EditTarget) => void;
  subscribe: (listener: EditListener) => () => void;
}

/** Create a fresh edit bus (one per {@link ClickableJson} tree). */
export const createEditBus = (): EditBus => {
  const listeners = new Set<EditListener>();
  return {
    emit: (pointer, target) => {
      for (const fn of listeners) fn(pointer, target);
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
};

/** Fired with the target JSON Pointer and whether to open (expand) or close. */
export type ExpansionListener = (target: string, open: boolean) => void;

/**
 * Broadcasts "expand/collapse all" commands across a single {@link ClickableJson}
 * tree. A node's toolbar `emit`s its own pointer; every collapsible container at
 * or under that pointer reacts (see {@link useExpandAll}).
 */
export interface ExpansionBus {
  emit: (target: string, open: boolean) => void;
  subscribe: (listener: ExpansionListener) => () => void;
}

/** Create a fresh expansion bus (one per {@link ClickableJson} tree). */
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

export interface ClickableJsonContextValue {
  pfx: string;
  onChange?: OnChange;
  /** Imperative channel used by node toolbars to open/focus a node's inline editor. */
  edit?: EditBus;
  /** Imperative channel used by node toolbars to expand/collapse a node's subtree. */
  expansion?: ExpansionBus;
}

export const context = React.createContext<ClickableJsonContextValue>(null!);

/** Whether `pointer` is at or under `target` (matched on pointer-segment boundaries). */
const isUnder = (pointer: string, target: string): boolean =>
  pointer === target || pointer.startsWith(target + '/') || target === '';

/**
 * Subscribe a collapsible container to "expand/collapse all" commands: `apply(open)`
 * is called whenever a command targets this `pointer` or one of its ancestors.
 */
export const useExpandAll = (pointer: string, apply: (open: boolean) => void): void => {
  const {expansion} = React.useContext(context);
  const ref = React.useRef({pointer, apply});
  ref.current = {pointer, apply};
  React.useEffect(() => {
    if (!expansion) return;
    return expansion.subscribe((target, open) => {
      if (isUnder(ref.current.pointer, target)) ref.current.apply(open);
    });
  }, [expansion]);
};
