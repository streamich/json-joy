import {Model} from '../../Model';
import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';

describe('find', () => {
  test('can find a key in root object', () => {
    const doc = Model.create();
    const builder1 = new PatchBuilder(doc.clock);
    const obj1 = builder1.obj();
    const f = builder1.const(false);
    builder1.insObj(obj1, [['foo', f]]);
    builder1.root(obj1);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find(['foo']).view()).toBe(false);
  });

  test('can find the root value', () => {
    const doc = Model.create();
    const builder1 = new PatchBuilder(doc.clock);
    const t = builder1.const(true);
    builder1.root(t);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find([]).view()).toBe(true);
  });

  test('can find elements in an array', () => {
    const doc = Model.create();
    const builder1 = new PatchBuilder(doc.clock);
    const obj = builder1.json([1, 'f', true]);
    builder1.root(obj);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find([0]).view()).toBe(1);
    expect(doc.api.find([1]).view()).toBe('f');
    expect(doc.api.find([2]).view()).toBe(true);
  });

  test('can find values in complex object', () => {
    const doc = Model.create();
    const builder1 = new PatchBuilder(doc.clock);
    const json = {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      name: 'Vadim',
      tags: ['News', 'Sports'],
      address: {
        lines: ['1st Ave', 'Top floor', 'New York'],
      },
      emailVerified: true,
      favoriteCar: null,
      '1': 'ok',
    };
    const obj = builder1.json(json);
    builder1.root(obj);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find([]).view()).toEqual(json);
    expect(doc.api.find(['id']).view()).toBe(json.id);
    expect(doc.api.find(['name']).view()).toBe(json.name);
    expect(doc.api.find(['tags']).view()).toEqual(json.tags);
    expect(doc.api.find(['tags', 0]).view()).toEqual(json.tags[0]);
    expect(doc.api.find(['tags', '0']).view()).toEqual(json.tags[0]);
    expect(doc.api.find(['tags', '1']).view()).toEqual(json.tags[1]);
    expect(doc.api.find(['tags', 1]).view()).toEqual(json.tags[1]);
    expect(doc.api.find(['address']).view()).toEqual(json.address);
    expect(doc.api.find(['address', 'lines']).view()).toEqual(json.address.lines);
    expect(doc.api.find(['address', 'lines', 0]).view()).toEqual(json.address.lines[0]);
    expect(doc.api.find(['address', 'lines', '0']).view()).toEqual(json.address.lines[0]);
    expect(doc.api.find(['address', 'lines', 1]).view()).toEqual(json.address.lines[1]);
    expect(doc.api.find(['address', 'lines', '1']).view()).toEqual(json.address.lines[1]);
    expect(doc.api.find(['address', 'lines', 2]).view()).toEqual(json.address.lines[2]);
    expect(doc.api.find(['address', 'lines', '2']).view()).toEqual(json.address.lines[2]);
    expect(doc.api.find(['emailVerified']).view()).toEqual(json.emailVerified);
    expect(doc.api.find(['favoriteCar']).view()).toEqual(json.favoriteCar);
    expect(doc.api.find(['1']).view()).toEqual(json['1']);
    expect(doc.api.find([1]).view()).toEqual(json['1']);
  });

  test('can use finder (.find()) on a sub-node', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({
      foo: {
        bar: {
          baz: 1,
        },
      },
    });
    expect(api.view()).toStrictEqual({
      foo: {
        bar: {
          baz: 1,
        },
      },
    });
    const foo = api.obj(['foo']);
    foo.set({a: 'b'});
    const bar = foo.obj(['bar']);
    bar.set({
      baz: 2,
      nil: null,
    });
    expect(api.view()).toStrictEqual({
      foo: {
        a: 'b',
        bar: {
          baz: 2,
          nil: null,
        },
      },
    });
  });

  test('can use finder (.find()) on a sub-array', () => {
    const doc = Model.create();
    const api = doc.api;
    api.set({
      foo: {
        bar: [1],
      },
    });
    expect(api.view()).toStrictEqual({
      foo: {
        bar: [1],
      },
    });
    const foo = api.obj(['foo']);
    const bar = foo.arr(['bar']);
    bar.ins(1, [22]);
    expect(api.view()).toStrictEqual({
      foo: {
        bar: [1, 22],
      },
    });
  });
});
