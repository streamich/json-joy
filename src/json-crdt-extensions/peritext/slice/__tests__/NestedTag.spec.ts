import {ObjApi, VecApi} from '../../../../json-crdt/model';
import {setup} from './setup';

describe('NestedTag', () => {
  test('can read name, discriminant, and data', () => {
    const kit = setup();
    const range = kit.peritext.rangeAt(9);
    const slice = kit.peritext.savedSlices.insMarker(range, [
      ['note'] as any,
      ['blockquote', 1, {foo: 'bar'}],
      ['p', 2, {indent: 2}],
    ]);
    const tag0 = slice.nestedType().tag(0);
    const tag1 = slice.nestedType().tag(1);
    const tag2 = slice.nestedType().tag(2);
    const tag3 = slice.nestedType().tag(3);
    expect(tag0.name()).toBe('note');
    expect(tag0.discriminant()).toBe(0);
    expect(tag0.data().view()).toEqual({});
    expect(tag0.name()).toBe('note');
    expect(tag0.discriminant()).toBe(0);
    expect(tag1.name()).toBe('blockquote');
    expect(tag1.discriminant()).toBe(1);
    expect(tag1.data().view()).toEqual({foo: 'bar'});
    expect(tag2.name()).toBe('p');
    expect(tag2.discriminant()).toBe(2);
    expect(tag2.data().view()).toEqual({indent: 2});
    expect(tag3.name()).toBe('p');
    expect(tag3.discriminant()).toBe(2);
    expect(tag3.data().view()).toEqual({indent: 2});
  });

  test('can update tag name', () => {
    const kit = setup();
    const range = kit.peritext.rangeAt(9);
    const slice = kit.peritext.savedSlices.insMarker(range, [
      ['note'] as any,
      ['blockquote', 1, {foo: 'bar'}],
      ['p', 2, {indent: 2}],
    ]);
    const tag0 = slice.nestedType().tag(0);
    const tag1 = slice.nestedType().tag(1);
    const tag2 = slice.nestedType().tag(2);
    expect(tag0.name()).toBe('note');
    expect(tag1.name()).toBe('blockquote');
    expect(tag2.name()).toBe('p');
    tag0.setName('a');
    tag1.setName('b');
    expect(tag0.name()).toBe('a');
    expect(tag1.name()).toBe('b');
    expect(tag2.name()).toBe('p');
    tag2.setName('c');
    expect(tag0.name()).toBe('a');
    expect(tag1.name()).toBe('b');
    expect(tag2.name()).toBe('c');
  });

  test('can update discriminant', () => {
    const kit = setup();
    const range = kit.peritext.rangeAt(9);
    const slice = kit.peritext.savedSlices.insMarker(range, [
      ['note'] as any,
      ['blockquote', 1, {foo: 'bar'}],
      ['p', 2, {indent: 2}],
    ]);
    const tag0 = slice.nestedType().tag(0);
    const tag1 = slice.nestedType().tag(1);
    const tag2 = slice.nestedType().tag(2);
    expect(tag0.discriminant()).toBe(0);
    expect(tag1.discriminant()).toBe(1);
    tag0.setDiscriminant(1);
    tag1.setDiscriminant(3);
    expect(tag0.discriminant()).toBe(1);
    expect(tag1.discriminant()).toBe(3);
    expect(tag2.discriminant()).toBe(2);
    tag1.setDiscriminant(2);
    tag2.setDiscriminant(4);
    expect(tag1.discriminant()).toBe(2);
    expect(tag2.discriminant()).toBe(4);
  });

  describe('.asVec()', () => {
    test('can convert basic type to a "vec" step', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, 'p');
      const node = slice.nestedType().tag(0).asVec();
      expect(node instanceof VecApi).toBe(true);
      expect(node.view()).toEqual(['p']);
    });

    test('can convert basic type to a "vec" step - 2', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, ['p']);
      const node = slice.nestedType().tag(0).asVec();
      expect(node instanceof VecApi).toBe(true);
      expect(node.view()).toEqual(['p']);
    });

    test('can convert basic type to a "vec" step - 3', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0]]);
      const node = slice.nestedType().tag(0).asVec();
      expect(node instanceof VecApi).toBe(true);
      expect(node.view()).toEqual(['p', 0]);
    });
  });

  describe('.data()', () => {
    test('creates empty {} object, when not provided', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, 'p');
      const node = slice.nestedType().tag(0).data();
      expect(node instanceof ObjApi).toBe(true);
      expect(node.view()).toEqual({});
    });

    test('converts node to "obj", if not already "obj', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [['p', 0, [] as any]]);
      const node = slice.nestedType().tag(0).data();
      expect(node instanceof ObjApi).toBe(true);
      expect(node.view()).toEqual({});
    });

    test('returns existing data node', () => {
      const kit = setup();
      const range = kit.peritext.rangeAt(9);
      const slice = kit.peritext.savedSlices.insMarker(range, [
        ['blockquote', 0, {foo: 'bar'}],
        ['p', 1, {indent: 2}],
      ]);
      const obj0 = slice.nestedType().tag(0).data();
      const obj1 = slice.nestedType().tag(1).data();
      const obj2 = slice.nestedType().tag(2).data();
      expect(obj0.view()).toEqual({foo: 'bar'});
      expect(obj1.view()).toEqual({indent: 2});
      expect(obj2.view()).toEqual({indent: 2});
    });
  });
});
