import type {BinaryOp, BinaryOpComponent} from './types';

export const append = (op: BinaryOp, component: BinaryOpComponent): void => {
  if (!component) return;
  if (!op.length) {
    op.push(component);
    return;
  }
  const lastIndex = op.length - 1;
  const last = op[lastIndex];
  if (typeof component === 'number') {
    if (typeof last === 'number') {
      if (component > 0 && last > 0) op[lastIndex] = last + component;
      else if (component < 0 && last < 0) op[lastIndex] = last + component;
      else op.push(component);
    } else op.push(component);
  } else if (component instanceof Uint8Array) {
    if (last instanceof Uint8Array) {
      const combined = new Uint8Array(last.length + component.length);
      combined.set(last, 0);
      combined.set(component, last.length);
      op[lastIndex] = combined;
    } else op.push(component);
  }
};

export const componentLength = (component: BinaryOpComponent): number => {
  return typeof component === 'number' ? Math.abs(component) : component.length;
};

export const isDeleteComponent = (component: BinaryOpComponent): boolean => {
  return typeof component === 'number' && component < 0;
};

export const trim = (op: BinaryOp): void => {
  if (!op.length) return;
  const last = op[op.length - 1];
  const isLastRetain = typeof last === 'number' && last > 0;
  if (isLastRetain) op.pop();
};

export const normalize = (op: BinaryOp): BinaryOp => {
  const op2: BinaryOp = [];
  const length = op.length;
  for (let i = 0; i < length; i++) append(op2, op[i]);
  trim(op2);
  return op2;
};

/**
 * Extracts a full or a part of a component from an operation.
 *
 * @param component Component from which to extract a chunk.
 * @param offset Position within the component to start from.
 * @param maxLength Maximum length of the component to extract.
 * @returns Full or partial component at index `index` of operation `op`.
 */
export const chunk = (component: BinaryOpComponent, offset: number, maxLength: number): BinaryOpComponent => {
  if (typeof component === 'number') {
    return component > 0 ? Math.min(component - offset, maxLength) : -Math.min(-component - offset, maxLength);
  } else if (component instanceof Uint8Array) {
    const end = Math.min(offset + maxLength, component.length);
    return component.subarray(offset, end);
  }
  return component;
};
