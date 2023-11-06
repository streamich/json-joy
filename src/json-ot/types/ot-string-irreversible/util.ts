import type {StringOp, StringOpComponent} from './types';

export const append = (op: StringOp, component: StringOpComponent): void => {
  if (!component) return;
  if (!op.length) {
    op.push(component);
    return;
  }
  const lastIndex = op.length - 1;
  const last = op[lastIndex];
  switch (typeof component) {
    case 'number': {
      if (typeof last === 'number') {
        if (component > 0 && last > 0) op[lastIndex] = last + component;
        else if (component < 0 && last < 0) op[lastIndex] = last + component;
        else op.push(component);
      } else op.push(component);
      break;
    }
    case 'string': {
      if (typeof last === 'string') op[lastIndex] = last + component;
      else op.push(component);
      break;
    }
  }
};

export const componentLength = (component: StringOpComponent): number => {
  switch (typeof component) {
    case 'number':
      return Math.abs(component);
    case 'string':
      return component.length;
  }
};

export const isDeleteComponent = (component: StringOpComponent): boolean => {
  return typeof component === 'number' && component < 0;
};

export const trim = (op: StringOp): void => {
  if (!op.length) return;
  const last = op[op.length - 1];
  const isLastRetain = typeof last === 'number' && last > 0;
  if (isLastRetain) op.pop();
};

export const normalize = (op: StringOp): StringOp => {
  const op2: StringOp = [];
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
export const chunk = (component: StringOpComponent, offset: number, maxLength: number): StringOpComponent => {
  switch (typeof component) {
    case 'number': {
      return component > 0 ? Math.min(component - offset, maxLength) : -Math.min(-component - offset, maxLength);
    }
    case 'string': {
      const end = Math.min(offset + maxLength, component.length);
      return component.substring(offset, end);
    }
  }
};
