import {InsStrOp} from '../../../../json-crdt-patch';
import {Model} from '../../Model';

describe('.diff()', () => {
  test('can merge changes into a string', () => {
    const doc = Model.create({
      foo: {
        bar: {
          baz: 'asdf',
        },
      },
    })!;
    const patch = doc.api.diff({
      foo: {
        bar: {
          baz: 'asdf!',
        },
      },
    })!;
    expect(patch.ops[0] instanceof InsStrOp).toBe(true);
    expect((patch.ops[0] as InsStrOp).data).toBe('!');
    doc.applyPatch(patch);
    expect(doc.view()).toEqual({
      foo: {
        bar: {
          baz: 'asdf!',
        },
      },
    });
  });
});

describe('.merge()', () => {
  test('can merge changes into an object', () => {
    const doc = Model.create({
      foo: 'bar',
      x: 123,
    });
    doc.api.merge({
      foo: 'baz!',
      x: 123,
      y: 'new',
    });
    expect(doc.view()).toEqual({
      foo: 'baz!',
      x: 123,
      y: 'new',
    });
  });

  test('can merge at a deep path', () => {
    const doc = Model.create({
      nested: {
        foo: 'bar',
        x: 123,
        address: {
          city: 'Wonderland',
          zip: '12345',
        },
      },
    });
    const node1 = doc.api;
    expect(node1.read('/nested/address/zip')).toBe('12345');
    const node2 = node1.in('/nested')!;
    const patch = node2.merge('/address/zip', 'VD 1234');
    const patchStr = patch + '';
    expect(patchStr.includes('del')).toBe(true);
    expect(patchStr.includes('ins_str')).toBe(true);
    expect(node1.read('/nested/address/zip')).toBe('VD 1234');
    expect(node2.read('/address/zip')).toBe('VD 1234');
    node1.merge('/nested/address/zip', '...');
    expect(node1.read('/nested/address/zip')).toBe('...');
    expect(node2.read('/address/zip')).toBe('...');
  });

  test('can merge changes into a string', () => {
    const doc = Model.create();
    doc.api.set({
      foo: {
        bar: {
          baz: 'asdf',
        },
      },
    });
    doc.api.merge({
      foo: {
        bar: {
          baz: 'asdf!',
        },
      },
    });
    expect(doc.view()).toEqual({
      foo: {
        bar: {
          baz: 'asdf!',
        },
      },
    });
  });

  test('can merge list of objects', () => {
    const doc = Model.create();
    doc.api.set({
      tldraw: {
        shapes: [
          {
            id: 'id-1',
            typeName: 'binding',
            type: 'arrow',
            fromId: 'shape:arrowId',
            toId: 'shape:someOtherShapeId',
            props: {
              terminal: 'end',
              isPrecise: true,
              isExact: false,
              normalizedAnchor: {
                x: 0.5,
                y: 0.5,
              },
            },
            meta: {},
          },
          {
            id: 'id-2',
            typeName: 'binding',
            type: 'circle',
            fromId: 'shape:arrowId',
            props: {
              terminal: 'end',
              isPrecise: true,
              isExact: false,
              normalizedAnchor: {
                x: 123.5,
                y: 123.5,
              },
            },
          },
        ],
      },
    });
    doc.api.select('/tldraw')!.merge({
      shapes: [
        {
          id: 'id-1',
          typeName: 'binding',
          type: 'arrow',
          fromId: 'shape:arrowId',
          toId: 'shape:someOtherShapeId',
          props: {
            terminal: 'end',
            isPrecise: true,
            isExact: false,
            normalizedAnchor: {
              x: 23,
              y: 23,
            },
          },
          meta: {},
        },
        {
          id: 'id-2',
          typeName: 'binding',
          type: 'circle',
          fromId: 'none',
          props: {
            terminal: 'end',
            isPrecise: true,
            isExact: false,
            normalizedAnchor: {
              x: 123.5,
              y: 123.5,
            },
          },
        },
      ],
    });
    expect(doc.view()).toEqual({
      tldraw: {
        shapes: [
          {
            id: 'id-1',
            typeName: 'binding',
            type: 'arrow',
            fromId: 'shape:arrowId',
            toId: 'shape:someOtherShapeId',
            props: {
              terminal: 'end',
              isPrecise: true,
              isExact: false,
              normalizedAnchor: {
                x: 23,
                y: 23,
              },
            },
            meta: {},
          },
          {
            id: 'id-2',
            typeName: 'binding',
            type: 'circle',
            fromId: 'none',
            props: {
              terminal: 'end',
              isPrecise: true,
              isExact: false,
              normalizedAnchor: {
                x: 123.5,
                y: 123.5,
              },
            },
          },
        ],
      },
    });
  });
});
