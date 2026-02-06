import {Model} from '../../model';
import {cmpNode} from '../cmpNode';
import {s} from '../../../json-crdt-patch';

describe('"con" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.con({foo: 'bar'}));
    expect(cmpNode(model.api.con([]).node, model.api.con([]).node)).toBe(true);
    const model2 = Model.create(s.str('asdf'));
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.con({foo: 'bar'}));
    const fork = model.fork();
    expect(cmpNode(model.api.con([]).node, fork.api.con([]).node)).toBe(true);
  });

  test('returns false for different nodes', () => {
    const model = Model.create(s.con({foo: 'bar'}));
    const fork = model.fork();
    fork.api.set(s.con({foo: 'baz'}));
    expect(cmpNode(model.api.con([]).node, fork.api.con([]).node)).toBe(false);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const schema = s.con(123);
    const model = Model.create(schema);
    model.api.set(schema);
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(schema, sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"val" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.val(s.con(1)));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
    const model2 = Model.create(s.str('asdf'));
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.val(s.str('bar')));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
  });

  test('returns false for different nodes', () => {
    const model = Model.create(s.val(s.str('bar')));
    const fork = model.fork();
    fork.api.set(s.val(s.str('baz')));
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const schema = s.val(s.con(123));
    const model = Model.create(schema);
    model.api.set(schema);
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(schema, sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"str" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.str('abc'));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
  });

  test('returns false for different node types', () => {
    const model = Model.create(s.str('abc'));
    const model2 = Model.create(s.con(123));
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.str('bar'));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
  });

  test('returns false for different nodes', () => {
    const model = Model.create(s.str('bar'));
    const fork1 = model.fork();
    fork1.api.set(s.str('baz'));
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    const fork2 = model.fork();
    fork2.s.$.ins(1, 'x');
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    const fork3 = model.fork();
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(true);
    model.s.$.del(1, 1);
    const fork4 = model.fork();
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork4.s.$.node)).toBe(true);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const schema = s.str('bar');
    const model = Model.create(schema);
    model.api.set(schema);
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(schema, sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"obj" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.obj({foo: s.str('bar')}));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
    const model2 = Model.create(s.obj({foo: s.str('bar'), gg: s.str('wp')}));
    expect(cmpNode(model2.s.$.node, model2.s.$.node)).toBe(true);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.obj({foo: s.str('bar')}));
    model.api.set(s.obj({foo: s.str('bar')}));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
    model.s.$.set({gg: 'wp'} as any);
    const fork2 = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(true);
    model.s.$.del(['foo']);
    const fork3 = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(true);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const model = Model.create(s.obj({foo: s.str('bar')}));
    model.api.set(s.obj({foo: s.str('bar')}));
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(s.obj({foo: s.str('bar')}), sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"arr" node', () => {
  test('returns false on different node types', () => {
    const model = Model.create(s.arr([s.str('bar')]));
    const model2 = Model.create(s.con(123));
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for identical nodes', () => {
    const model = Model.create(s.arr([s.str('bar')]));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
    const model2 = Model.create(s.arr([s.str('bar'), s.str('wp')]));
    expect(cmpNode(model2.s.$.node, model2.s.$.node)).toBe(true);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.arr([s.str<string>('bar')]));
    model.api.set(s.arr([s.str('bar')]));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
    model.s.$.ins(1, ['gg']);
    const fork2 = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(true);
    model.s.$.del(0, 1);
    const fork3 = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(true);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const schema = s.arr([s.str('bar')]);
    const model = Model.create(schema);
    model.api.set(schema);
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(schema, sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"bin" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.bin(new Uint8Array([1, 2, 3])));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
  });

  test('returns false for different node types', () => {
    const model = Model.create(s.bin(new Uint8Array([1, 2, 3])));
    const model2 = Model.create(s.con(123));
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.bin(new Uint8Array([1, 2, 3])));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
  });

  test('returns false for different nodes', () => {
    const model = Model.create(s.bin(new Uint8Array([1, 2, 3])));
    const fork1 = model.fork();
    fork1.api.set(s.bin(new Uint8Array([4, 5, 6])));
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    const fork2 = model.fork();
    fork2.s.$.ins(1, new Uint8Array([7]));
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    const fork3 = model.fork();
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(true);
    model.s.$.del(1, 1);
    const fork4 = model.fork();
    expect(cmpNode(model.s.$.node, fork1.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork3.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork4.s.$.node)).toBe(true);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const schema = s.bin(new Uint8Array([1, 2, 3]));
    const model = Model.create(schema);
    model.api.set(schema);
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(schema, sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});

describe('"vec" node', () => {
  test('returns true for identical nodes', () => {
    const model = Model.create(s.vec(s.str('bar')));
    expect(cmpNode(model.s.$.node, model.s.$.node)).toBe(true);
    const model2 = Model.create(s.vec(s.str('bar')));
    expect(cmpNode(model2.s.$.node, model2.s.$.node)).toBe(true);
  });

  test('returns true for equal nodes', () => {
    const model = Model.create(s.vec(s.str('bar')));
    model.api.set(s.vec(s.str('bar')));
    const fork = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(true);
    model.s.$.set([[1, s.str('gg')]]);
    const fork2 = model.fork();
    expect(cmpNode(model.s.$.node, fork.s.$.node)).toBe(false);
    expect(cmpNode(model.s.$.node, fork2.s.$.node)).toBe(true);
  });

  test('returns false for equivalent nodes but with different sids', () => {
    const model = Model.create(s.vec(s.str('bar')));
    model.api.set(s.vec(s.str('bar')));
    const fork = model.fork();
    const sid = fork.clock.sid;
    const model2 = Model.create(s.vec(s.str('bar')), sid);
    expect(cmpNode(model.s.$.node, model2.s.$.node)).toBe(false);
  });
});
