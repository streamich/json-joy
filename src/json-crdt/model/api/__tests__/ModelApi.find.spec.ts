import {Model} from '../../Model';
import {PatchBuilder} from '../../../../json-crdt-patch/PatchBuilder';
import {FALSE_ID, TRUE_ID} from '../../../../json-crdt-patch/constants';

describe('find', () => {
  test('can find a key in root object', () => {
    const doc = Model.withLogicalClock();
    const builder1 = new PatchBuilder(doc.clock);
    const obj1 = builder1.obj();
    builder1.setKeys(obj1, [['foo', FALSE_ID]]);
    builder1.root(obj1);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find(['foo']).toJson()).toBe(false);
  });

  test('can find the root value', () => {
    const doc = Model.withLogicalClock();
    const builder1 = new PatchBuilder(doc.clock);
    builder1.root(TRUE_ID);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find([]).toJson()).toBe(true);
  });

  test('can find elements in an array', () => {
    const doc = Model.withLogicalClock();
    const builder1 = new PatchBuilder(doc.clock);
    const obj = builder1.json([1, 'f', true]);
    builder1.root(obj);
    doc.applyPatch(builder1.patch);
    expect(doc.api.find([0]).toJson()).toBe(1);
    expect(doc.api.find([1]).toJson()).toBe('f');
    expect(doc.api.find([2]).toJson()).toBe(true);
  });

  test('can find values in complex object', () => {
    const doc = Model.withLogicalClock();
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
    expect(doc.api.find([]).toJson()).toEqual(json);
    expect(doc.api.find(['id']).toJson()).toBe(json.id);
    expect(doc.api.find(['name']).toJson()).toBe(json.name);
    expect(doc.api.find(['tags']).toJson()).toEqual(json.tags);
    expect(doc.api.find(['tags', 0]).toJson()).toEqual(json.tags[0]);
    expect(doc.api.find(['tags', '0']).toJson()).toEqual(json.tags[0]);
    expect(doc.api.find(['tags', '1']).toJson()).toEqual(json.tags[1]);
    expect(doc.api.find(['tags', 1]).toJson()).toEqual(json.tags[1]);
    expect(doc.api.find(['address']).toJson()).toEqual(json.address);
    expect(doc.api.find(['address', 'lines']).toJson()).toEqual(json.address.lines);
    expect(doc.api.find(['address', 'lines', 0]).toJson()).toEqual(json.address.lines[0]);
    expect(doc.api.find(['address', 'lines', '0']).toJson()).toEqual(json.address.lines[0]);
    expect(doc.api.find(['address', 'lines', 1]).toJson()).toEqual(json.address.lines[1]);
    expect(doc.api.find(['address', 'lines', '1']).toJson()).toEqual(json.address.lines[1]);
    expect(doc.api.find(['address', 'lines', 2]).toJson()).toEqual(json.address.lines[2]);
    expect(doc.api.find(['address', 'lines', '2']).toJson()).toEqual(json.address.lines[2]);
    expect(doc.api.find(['emailVerified']).toJson()).toEqual(json.emailVerified);
    expect(doc.api.find(['favoriteCar']).toJson()).toEqual(json.favoriteCar);
    expect(doc.api.find(['1']).toJson()).toEqual(json['1']);
    expect(doc.api.find([1]).toJson()).toEqual(json['1']);
  });
});
