import * as React from 'react';
import {useFocus} from '../context/focus';
import {useInput} from '../context/input';
import {useStyles} from '../context/style';
import {FocusRegion} from '../FocusRegion';
import {context} from './context';
import {useIsolation} from './isolation';
import {JsonToolbar} from './JsonToolbar';

export interface JsonHoverableProps {
  pointer: string;
  /** The JSON value at {@link pointer}; used by the focused node's toolbar. */
  value: unknown;
  /** How this node sits in its parent: a `string` for an object property (key),
   * a `number` for an array element, `undefined` for the root. */
  property?: string | number;
  children: React.ReactElement;
}

/**
 * Runs `fn` after the toolbar menu popup has closed and restored DOM focus to
 * its trigger button. The popup re-focuses its trigger on close via a single
 * `requestAnimationFrame`; opening the insert editor one extra frame past that
 * lets the new input keep focus instead of losing it back to the chevron.
 */
const afterPopupRestore = (fn: () => void): void => {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => requestAnimationFrame(fn));
  else fn();
};

/** Non-container nodes (primitives, binary) have no opening bracket for the toolbar
 * to hang off, so it overlaps the value. Nudge it 16px right and 8px up to clear. */
const leafToolbarStyle: React.CSSProperties = {transform: 'translate(16px, -8px)'};

export const JsonHoverable: React.FC<JsonHoverableProps> = ({pointer, value, property, children}) => {
  const {focused, focus, pointed, point} = useFocus();
  const {pfx, onChange, edit, expansion} = React.useContext(context);
  const {compact} = useStyles();
  const {isolate, isolated} = useIsolation();
  const input = useInput();
  const canIsolate = !!isolate && pointer !== '' && pointer !== isolated;

  const prefixedPointer = pfx + pointer;
  const name = pointer.slice(pointer.lastIndexOf('/') + 1);

  // Per-node actions, surfaced in the toolbar's "Actions" group. Only available
  // when the tree is editable (`onChange` is set).
  const isArray = Array.isArray(value);
  const isBinary = value instanceof Uint8Array;
  const isObject = !isArray && !isBinary && typeof value === 'object' && value !== null;
  const isPrimitive = !isArray && !isObject && !isBinary; // string | number | boolean | null — has a value editor
  const isKey = typeof property === 'string'; // object property
  const isElement = typeof property === 'number'; // array element
  const emit =
    onChange && edit
      ? (target: 'insert' | 'key' | 'value', p: string) => () => afterPopupRestore(() => edit.emit(p, target))
      : undefined;

  const insertPointer = isObject ? pointer : isArray ? `${pointer}/-` : undefined;
  const onEditKey = emit && isKey ? emit('key', pointer) : undefined;
  const onEditValue = emit && (isKey || isElement) && isPrimitive ? emit('value', pointer) : undefined;
  const onAdd = emit && insertPointer !== undefined ? emit('insert', insertPointer) : undefined;
  const addLabel = isObject ? 'Add key' : isArray ? 'Add element' : undefined;
  const onDelete = onChange && pointer !== '' ? () => onChange([{op: 'remove', path: pointer}]) : undefined;

  const isContainer = isObject || isArray;
  const onExpandAll = isContainer && expansion ? () => expansion.emit(pointer, true) : undefined;
  const onCollapseAll = isContainer && expansion ? () => expansion.emit(pointer, false) : undefined;

  const toolbar = input.focused ? undefined : (
    <JsonToolbar
      data={value}
      name={name}
      onEditKey={onEditKey}
      onEditValue={onEditValue}
      onAdd={onAdd}
      addLabel={addLabel}
      onDelete={onDelete}
      onIsolate={canIsolate && isolate ? () => isolate(pointer) : undefined}
      onExpandAll={onExpandAll}
      onCollapseAll={onCollapseAll}
    />
  );

  const onMouseMove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pointed !== prefixedPointer) point(prefixedPointer);
  };

  const onMouseEnter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    point(prefixedPointer);
  };

  const onMouseLeave = () => {
    point(null);
  };

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    focus(prefixedPointer);
  };

  const onDoubleClick =
    canIsolate && isolate
      ? (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          isolate(pointer);
        }
      : undefined;

  return (
    <FocusRegion
      pointed={pointed === prefixedPointer}
      focused={focused === prefixedPointer}
      compact={compact}
      toolbar={toolbar}
      toolbarStyle={isContainer ? undefined : leafToolbarStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDelete={
        onChange && !input.focused && prefixedPointer === focused
          ? () => onChange([{op: 'remove', path: pointer}])
          : undefined
      }
    >
      {children}
    </FocusRegion>
  );
};
