import type {ApplyFn, PredicateOperationFn} from './types';

export const predicateOpWrapper = (fn: PredicateOperationFn): ApplyFn => {
  return (doc: unknown): unknown => {
    const test = fn(doc);
    if (!test) throw new Error('TEST');
    return doc;
  };
};
