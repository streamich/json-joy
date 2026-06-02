import {Model} from '../../Model';
import {s} from '../../../../json-crdt-patch';

const setup = () =>
  Model.create(
    s.obj({
      title: s.str('Hello'),
      count: s.con(1234),
      flag: s.con(true),
      obj: s.obj({
        nested: s.obj({
          address: s.obj({
            street: s.str('1st Ave'),
            city: s.str('New York'),
          }),
        }),
      }),
      val: s.val(s.con('register')),
      vec: s.vec(s.con('a'), s.con('b'), s.con(true)),
      arr: s.arr([s.con('x'), s.con('y'), s.con('z')]),
    }),
  );

describe('.w reads', () => {
  test('reads leaf scalars as raw values', () => {
    const model = setup();
    expect(model.w.title).toBe('Hello');
    expect(model.w.count).toBe(1234);
    expect(model.w.flag).toBe(true);
  });

  test('reads nested object properties', () => {
    const model = setup();
    expect(model.w.obj.nested.address.city).toBe('New York');
    expect(model.w.obj.nested.address.street).toBe('1st Ave');
  });

  test('resolves "val" registers transparently', () => {
    const model = setup();
    expect(model.w.val).toBe('register');
  });

  test('reads array elements by index and exposes length', () => {
    const model = setup();
    expect(model.w.arr[0]).toBe('x');
    expect(model.w.arr[2]).toBe('z');
    expect(model.w.arr.length).toBe(3);
  });

  test('reads vector elements by index', () => {
    const model = setup();
    expect(model.w.vec[0]).toBe('a');
    expect(model.w.vec[2]).toBe(true);
  });

  test('missing object keys read back as undefined (not throwing)', () => {
    const model = setup();
    expect((model.w as any).doesNotExist).toBe(undefined);
  });

  test('reads as a plain object deep-equal to view()', () => {
    const model = setup();
    expect(JSON.parse(JSON.stringify(model.w))).toEqual(model.view());
  });

  test('node handles remain available through `.s` (manual control)', () => {
    const model = setup();
    expect(typeof model.s.arr.$.push).toBe('function');
    expect(model.s.arr.$.length()).toBe(3);
  });

  test('supports has / Object.keys / spread on objects', () => {
    const model = setup();
    expect('title' in model.w).toBe(true);
    expect('nope' in model.w).toBe(false);
    expect(Object.keys(model.w).sort()).toEqual(['arr', 'count', 'flag', 'obj', 'title', 'val', 'vec']);
    expect({...model.w.obj.nested.address}).toEqual({street: '1st Ave', city: 'New York'});
  });
});

describe('.w object writes', () => {
  test('assigning an existing key records an op and updates the view', () => {
    const model = setup();
    model.w.title = 'World';
    expect(model.w.title).toBe('World');
    expect(model.view().title).toBe('World');
  });

  test('assigning a new key adds it', () => {
    const model = setup();
    (model.w as any).extra = 42;
    expect((model.view() as any).extra).toBe(42);
  });

  test('deleting a key removes it', () => {
    const model = setup();
    delete (model.w as any).title;
    expect((model.view() as any).title).toBe(undefined);
    expect('title' in model.w).toBe(false);
  });

  test('deep nested assignment works through the proxy chain', () => {
    const model = setup();
    model.w.obj.nested.address.city = 'Los Angeles';
    expect(model.w.obj.nested.address.city).toBe('Los Angeles');
    expect(model.view().obj.nested.address.city).toBe('Los Angeles');
    // sibling untouched
    expect(model.view().obj.nested.address.street).toBe('1st Ave');
  });

  test('assigning a whole object value builds a subtree', () => {
    const model = setup();
    (model.w as any).meta = {a: 1, b: {c: 2}};
    expect((model.view() as any).meta).toEqual({a: 1, b: {c: 2}});
  });
});

describe('.w array writes', () => {
  test('assigning to an existing index overwrites the element', () => {
    const model = setup();
    model.w.arr[1] = 'Y2';
    expect(model.view().arr).toEqual(['x', 'Y2', 'z']);
  });

  test('assigning to index === length appends', () => {
    const model = setup();
    model.w.arr[3] = 'w';
    expect(model.view().arr).toEqual(['x', 'y', 'z', 'w']);
  });

  test('assigning past the end throws OUT_OF_BOUNDS', () => {
    const model = setup();
    expect(() => {
      model.w.arr[10] = 'too far';
    }).toThrow('OUT_OF_BOUNDS');
  });

  test('deleting an index removes the element', () => {
    const model = setup();
    delete model.w.arr[1];
    expect(model.view().arr).toEqual(['x', 'z']);
  });

  test('push / pop / shift / unshift behave like a real array', () => {
    const model = setup();
    expect(model.w.arr.push('w')).toBe(4);
    expect(model.view().arr).toEqual(['x', 'y', 'z', 'w']);
    expect(model.w.arr.pop()).toBe('w');
    expect(model.view().arr).toEqual(['x', 'y', 'z']);
    expect(model.w.arr.shift()).toBe('x');
    expect(model.view().arr).toEqual(['y', 'z']);
    expect(model.w.arr.unshift('a', 'b')).toBe(4);
    expect(model.view().arr).toEqual(['a', 'b', 'y', 'z']);
  });

  test('splice inserts and removes', () => {
    const model = setup();
    const removed = model.w.arr.splice(1, 1, 'Y', 'Y2');
    expect(removed).toEqual(['y']);
    expect(model.view().arr).toEqual(['x', 'Y', 'Y2', 'z']);
  });

  test('sort / reverse reconcile via merge', () => {
    const model = setup();
    model.w.arr.reverse();
    expect(model.view().arr).toEqual(['z', 'y', 'x']);
    model.w.arr.sort();
    expect(model.view().arr).toEqual(['x', 'y', 'z']);
  });

  test('arr.length = n truncates', () => {
    const model = setup();
    model.w.arr.length = 1;
    expect(model.view().arr).toEqual(['x']);
  });

  test('mixing .w array methods with .s node handles', () => {
    const model = setup();
    model.s.arr.$.ins(0, ['start']); // manual insert via the node API
    model.w.arr.push('end'); // ergonomic append via the writable proxy
    expect(model.view().arr).toEqual(['start', 'x', 'y', 'z', 'end']);
  });
});

describe('.w array reads behave like a plain array', () => {
  test('iteration, spread, map, indexOf, includes', () => {
    const model = setup();
    expect([...model.w.arr]).toEqual(['x', 'y', 'z']);
    expect(model.w.arr.map((v) => v.toUpperCase())).toEqual(['X', 'Y', 'Z']);
    expect(model.w.arr.indexOf('y')).toBe(1);
    expect(model.w.arr.includes('z')).toBe(true);
    let joined = '';
    for (const v of model.w.arr) joined += v;
    expect(joined).toBe('xyz');
  });
});

describe('.w deep element mutation (arrays of objects)', () => {
  const objArr = () =>
    Model.create(
      s.obj({
        items: s.arr([s.obj({name: s.str('a'), n: s.con(1)}), s.obj({name: s.str('b'), n: s.con(2)})]),
      }),
    );

  test('arr[i].field = value mutates the element in place', () => {
    const model = objArr();
    model.w.items[0].name = 'A';
    model.w.items[0].n = 11;
    expect(model.view().items[0]).toEqual({name: 'A', n: 11});
    expect(model.view().items[1]).toEqual({name: 'b', n: 2});
  });

  test('arr.at(i).field = value mutates the element (deep proxy, not a snapshot)', () => {
    const model = objArr();
    model.w.items.at(1)!.name = 'B';
    expect(model.view().items[1].name).toBe('B');
  });

  test('map yields live element proxies that can be mutated', () => {
    const model = objArr();
    model.w.items.map((item) => {
      item.name = item.name.toUpperCase();
    });
    expect(model.view().items.map((i) => i.name)).toEqual(['A', 'B']);
  });

  test('for...of yields live element proxies', () => {
    const model = objArr();
    for (const item of model.w.items) item.n = (item.n as number) * 10;
    expect(model.view().items.map((i) => i.n)).toEqual([10, 20]);
  });
});

describe('.w vector writes', () => {
  test('assigning to an index overwrites the element', () => {
    const model = setup();
    model.w.vec[1] = 'B2';
    expect(model.view().vec).toEqual(['a', 'B2', true]);
  });

  test('out-of-range vector index assignment is rejected', () => {
    const model = setup();
    expect(() => {
      // vectors are fixed-length; index 9 does not exist
      (model.w.vec as any)[9] = 'nope';
    }).toThrow();
  });
});

describe('.w on sub-nodes', () => {
  test('can take a writable proxy of a sub-node and mutate it', () => {
    const model = setup();
    const address = model.api.obj(['obj', 'nested', 'address']).w;
    address.city = 'Boston';
    expect(model.view().obj.nested.address.city).toBe('Boston');
  });
});

describe('.w records collaborative operations (convergence)', () => {
  test('writes emit a patch that converges a forked replica', () => {
    const local = setup();
    local.api.flush();
    const remote = local.fork();
    // Mutate the local replica purely through the writable proxy.
    local.w.title = 'Edited';
    local.w.obj.nested.address.city = 'Seattle';
    local.w.arr[0] = 'X';
    local.w.arr.push('new');
    const patch = local.api.flush();
    expect(patch.ops.length).toBeGreaterThan(0);
    // Ship the patch to the remote replica.
    remote.applyPatch(patch);
    expect(remote.view()).toEqual(local.view());
    expect(remote.view().title).toBe('Edited');
    expect(remote.view().obj.nested.address.city).toBe('Seattle');
    expect(remote.view().arr).toEqual(['X', 'y', 'z', 'new']);
  });
});
