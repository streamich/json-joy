import {type NodeBuilder, s, nodes} from '../../../json-crdt-patch';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {cmpUint8Array} from '@jsonjoy.com/buffers/lib/cmpUint8Array';
import {Model} from '../../model';
import {toSchema} from '../toSchema';
import {cnt} from '../../../json-crdt-extensions';

const cmp = (a: NodeBuilder, b: NodeBuilder): boolean => {
  if (a instanceof nodes.con && b instanceof nodes.con) return deepEqual(a.raw, b.raw);
  else if (a instanceof nodes.val && b instanceof nodes.val) return cmp(a.value, b.value);
  else if (a instanceof nodes.obj && b instanceof nodes.obj) {
    const objAKeys = Object.keys(a.obj);
    const objBKeys = Object.keys(a.obj);
    const objALen = objAKeys.length;
    const objBLen = objBKeys.length;
    if (objALen !== objBLen) return false;
    const optAKeys = Object.keys(a.opt || {});
    const optBKeys = Object.keys(b.opt || {});
    const optALen = optAKeys.length;
    const optBLen = optBKeys.length;
    if (optALen !== optBLen) return false;
    for (let i = 0; i < objALen; i++) {
      const key = objAKeys[i];
      if (!cmp(a.obj[key], b.obj[key])) return false;
    }
    for (let i = 0; i < optALen; i++) {
      const key = optAKeys[i];
      if (!cmp(a.opt![key], b.opt![key])) return false;
    }
    return true;
  } else if (a instanceof nodes.vec && b instanceof nodes.vec) {
    const vecA = a.value;
    const vecB = b.value;
    const len = vecA.length;
    if (len !== vecB.length) return false;
    for (let i = 0; i < len; i++) if (!cmp(vecA[i], vecA[i])) return false;
    return true;
  } else if (a instanceof nodes.str && b instanceof nodes.str) return a.raw === b.raw;
  else if (a instanceof nodes.bin && b instanceof nodes.bin) return cmpUint8Array(a.raw, b.raw);
  else if (a instanceof nodes.arr && b instanceof nodes.arr) {
    const arrA = a.arr;
    const arrB = b.arr;
    const len = arrA.length;
    if (len !== arrB.length) return false;
    for (let i = 0; i < len; i++) if (!cmp(arrA[i], arrB[i])) return false;
    return true;
  }
  return false;
};

test('can infer schema of a document nodes', () => {
  const con = s.con('con');
  const str = s.str('hello');
  const obj = s.obj({
    id: s.con('id'),
    val: s.val(s.str('world')),
  });
  const schema = s.obj({
    con,
    str,
    bin: s.bin(new Uint8Array([1, 2, 3])),
    obj,
    vec: s.vec(s.con(1), s.con({foo: 'bar'})),
    arr: s.arr([s.con(1), s.con({foo: 'bar'})]),
  });
  const model = Model.create(schema);
  const node = model.root.node();
  const schema2 = toSchema(node);
  expect(cmp(schema, schema2)).toBe(true);
  const conSchema = toSchema(model.api.con('con').node);
  expect(cmp(con, conSchema)).toBe(true);
  expect(cmp(str, conSchema)).toBe(false);
  const strSchema = toSchema(model.api.str('str').node);
  expect(cmp(str, strSchema)).toBe(true);
  expect(cmp(con, strSchema)).toBe(false);
  const objSchema = toSchema(model.api.obj('obj').node);
  expect(cmp(obj, objSchema)).toBe(true);
  expect(cmp(con, objSchema)).toBe(false);
});

test('can copy a model with extension', () => {
  const schema = s.obj({
    count: cnt.new(1),
  });
  const model = Model.create();
  model.api.set(schema);
  model.ext.register(cnt);
  const copy = toSchema(model.root.node());
  const model2 = Model.create(copy, model.clock.sid);
  expect(model2.view()).toMatchObject({
    count: [
      expect.any(Uint8Array),
      {
        [model2.clock.sid.toString(36)]: 1,
      },
    ],
  });
});
