import {s} from '../../../json-crdt-patch';
import {Model} from '../Model';
import {pathTo} from '../pathTo';

describe('pathTo()', () => {
  test('resolves relative to a given ancestor, undefined when not reachable', () => {
    const doc = Model.create();
    doc.api.set({a: {b: {c: 1}}});
    const root = doc.root;
    const a = doc.api.obj(['a']).node;
    const b = doc.api.obj(['a', 'b']).node;
    expect(pathTo(b, root)).toEqual(['a', 'b']);
    expect(pathTo(b, a)).toEqual(['b']);
    expect(pathTo(a, b)).toBe(undefined);
  });

  test('"arr" and "vec" nodes', () => {
    const doc = Model.create(
      s.obj({
        foo: s.arr([
          s.con(1),
          s.vec(
            s.con(2),
            s.obj({
              bar: s.con(3),
            }),
          ),
        ]),
      }),
    );
    const root = doc.root;
    const n1 = doc.api.in(['foo', 0]).node;
    const n2 = doc.api.in(['foo', 1, 0]).node;
    const n3 = doc.api.in(['foo', 1, 1, 'bar']).node;
    expect(pathTo(n1, root)).toEqual(['foo', 0]);
    expect(pathTo(n2, root)).toEqual(['foo', 1, 0]);
    expect(pathTo(n3, root)).toEqual(['foo', 1, 1, 'bar']);
    expect(pathTo(n1)).toEqual(['foo', 0]);
    expect(pathTo(n2)).toEqual(['foo', 1, 0]);
    expect(pathTo(n3)).toEqual(['foo', 1, 1, 'bar']);
  });
});
