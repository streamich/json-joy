import {PredicateOperationFn} from './types';

export const predicateOpWrapper = (doc: unknown, fn: PredicateOperationFn): unknown => {
  const test = fn(doc);
  if (!test) throw new Error('TEST');
  return doc;
}
