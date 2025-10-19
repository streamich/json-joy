import {sort} from '@jsonjoy.com/util/lib/sort/insertion';
import {nodes, type SchemaNode} from '../json-crdt-patch/schema';
import {hash} from './hash';
import {structHash} from './structHash';

export const structHashSchema = (node?: SchemaNode | unknown): string => {
  if (node instanceof nodes.con || node instanceof nodes.str || node instanceof nodes.bin) return structHash(node.raw);
  else if (node instanceof nodes.val) return structHashSchema(node.value);
  else if (node instanceof nodes.obj) {
    let res = '{';
    const fields = {...node.obj, ...node.opt};
    const keys = Object.keys(fields);
    sort(keys);
    const length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      const value = fields[key];
      res += hash(key).toString(36) + ':' + structHashSchema(value) + ',';
    }
    return res + '}';
  } else if (node instanceof nodes.arr || node instanceof nodes.vec) {
    let res = '[';
    const children = node instanceof nodes.arr ? node.arr : node.value;
    for (const child of children) res += structHashSchema(child) + ';';
    return res + ']';
  }
  return structHash(node);
};
