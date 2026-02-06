import {Model} from '../model';
import {cmp} from './cmp';
import type {NodeBuilder} from '../../json-crdt-patch';

export const cmpSchema = (a: NodeBuilder, b: NodeBuilder, compareContent: boolean): boolean => {
  const model1 = Model.create(a);
  const model2 = Model.create(b);
  return cmp(model1.root, model2.root, compareContent);
};
