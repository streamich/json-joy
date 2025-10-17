import {s} from '../../../../json-crdt-patch';
import {printTree} from 'tree-dump';
import type {ExtApi} from '../../../extensions/types';
import {Model, NodeApi} from '../../../model';
import type {StrNode} from '../../nodes';
import {Extension} from '../../../extensions/Extension';
import {ExtNode} from '../../../extensions/ExtNode';

test('treats a simple "vec" node as a vector', () => {
  const model = Model.create();
  model.api.set({
    vec: s.vec(),
  });
  expect(model.view()).toEqual({
    vec: [],
  });
  expect(model.api.vec(['vec']).node.isExt()).toBe(false);
});

test('does not treat "vec" node as extension, if extension is not registered in registry', () => {
  const model = Model.create();
  model.api.set({
    vec: s.vec(),
  });
  const vec = model.api.vec(['vec']);
  const buf = new Uint8Array(3);
  buf[0] = 42;
  buf[1] = vec.node.id.sid % 256;
  buf[2] = vec.node.id.time % 256;
  vec.push(buf, 123);
  expect(vec.node.isExt()).toBe(false);
});

describe('sample extension', () => {
  const DoubleConcatExt = new Extension<123, StrNode, any, any, any, any>(
    123,
    'double-concat',
    class extends ExtNode<StrNode<string>> {
      public extId: number = 123;

      public name(): string {
        return 'double-concat';
      }

      public view(): string {
        const str = String(this.data.view());
        return str + str;
      }

      public toString(tab?: string): string {
        return `${this.name()} (${this.view()})` + printTree(tab, [(tab) => this.data.toString(tab)]);
      }
    },
    class extends NodeApi<any> implements ExtApi<any> {
      public ins(index: number, text: string): this {
        const {api, node} = this;
        const dataApi = api.wrap(node.data as StrNode);
        dataApi.ins(index, text);
        return this;
      }
    },
    (value: string = '') => s.json(value),
  );

  test('can run an extension', () => {
    const model = Model.create();
    model.ext.register(DoubleConcatExt);
    model.api.set({
      str: DoubleConcatExt.new('foo'),
    });
    expect(model.view()).toEqual({
      str: 'foofoo',
    });
  });

  test('can use extension node', () => {
    const model = Model.create();
    model.ext.register(DoubleConcatExt);
    model.api.set({
      str: DoubleConcatExt.new('abc'),
    });
    const extNode = model.api.in(['str']).asExt(DoubleConcatExt).node;
    expect(extNode.view()).toBe('abcabc');
  });

  test('can use extension API node', () => {
    const model = Model.create();
    model.ext.register(DoubleConcatExt);
    model.api.set({
      str: DoubleConcatExt.new('abc'),
    });
    const extStr = model.api.in(['str']).asExt(DoubleConcatExt);
    extStr.ins(1, '.');
    expect(model.view()).toEqual({
      str: 'a.bca.bc',
    });
  });
});
