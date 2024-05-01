import {ITimestampStruct, delayed, s} from '../../../../json-crdt-patch';
import {printTree, Printable} from 'tree-dump';
import {ext} from '../../../extensions';
import {ExtensionApi, ExtensionDefinition, ExtensionJsonNode} from '../../../extensions/types';
import {Model, NodeApi} from '../../../model';
import {StrNode} from '../../nodes';
import {JsonNode} from '../../types';

test('treats a simple "vec" node as a vector', () => {
  const model = Model.withLogicalClock();
  model.api.root({
    vec: s.vec(),
  });
  expect(model.view()).toEqual({
    vec: [],
  });
  expect(model.api.vec(['vec']).node.isExt()).toBe(false);
});

test('does not treat "vec" node as extension, if extension is not registered in registry', () => {
  const model = Model.withLogicalClock();
  model.api.root({
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
  const DoubleConcatExt: ExtensionDefinition<StrNode, any, any> = {
    id: 123,
    name: 'double-concat',
    new: (value: string = '') =>
      ext(
        123,
        delayed((builder) => builder.json(value)),
      ),
    Node: class CntNode implements ExtensionJsonNode, Printable {
      public readonly id: ITimestampStruct;

      constructor(public readonly data: StrNode) {
        this.id = data.id;
      }

      public name(): string {
        return 'double-concat';
      }

      public view(): string {
        const str = String(this.data.view());
        return str + str;
      }

      public children(callback: (node: JsonNode) => void): void {}

      public child?(): JsonNode | undefined {
        return this.data;
      }

      public container(): JsonNode | undefined {
        return this.data.container();
      }

      public api: undefined | unknown = undefined;

      public toString(tab?: string): string {
        return `${this.name()} (${this.view()})` + printTree(tab, [(tab) => this.data.toString(tab)]);
      }
    },
    Api: class CntApi extends NodeApi<any> implements ExtensionApi<any> {
      public ins(index: number, text: string): this {
        const {api, node} = this;
        const dataApi = api.wrap(node.data as StrNode);
        dataApi.ins(index, text);
        return this;
      }
    },
  };

  test('can run an extension', () => {
    const model = Model.withLogicalClock();
    model.ext.register(DoubleConcatExt);
    model.api.root({
      str: DoubleConcatExt.new('foo'),
    });
    expect(model.view()).toEqual({
      str: 'foofoo',
    });
  });

  test('can use extension node', () => {
    const model = Model.withLogicalClock();
    model.ext.register(DoubleConcatExt);
    model.api.root({
      str: DoubleConcatExt.new('abc'),
    });
    const extNode = model.api.in(['str']).asExt(DoubleConcatExt).node;
    expect(extNode.view()).toBe('abcabc');
  });

  test('can use extension API node', () => {
    const model = Model.withLogicalClock();
    model.ext.register(DoubleConcatExt);
    model.api.root({
      str: DoubleConcatExt.new('abc'),
    });
    const extStr = model.api.in(['str']).asExt(DoubleConcatExt);
    extStr.ins(1, '.');
    expect(model.view()).toEqual({
      str: 'a.bca.bc',
    });
  });
});
