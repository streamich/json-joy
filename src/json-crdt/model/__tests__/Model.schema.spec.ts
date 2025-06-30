import {type nodes, s} from '../../../json-crdt-patch';
import {SESSION} from '../../../json-crdt-patch/constants';
import {Model} from '../Model';

describe('.setSchema()', () => {
  test('can set object schema', () => {
    const model = Model.create().setSchema(
      s.obj({
        str: s.str('asdf'),
        con: s.con(123),
      }),
    );
    expect(model.s.str.toApi().view()).toBe('asdf');
    expect(model.s.con.toApi().view()).toBe(123);
  });

  test('can set map schema', () => {
    const model = Model.create().setSchema(
      s.map<nodes.str | nodes.con<number>>({
        str: s.str('asdf'),
        con1: s.con(123),
      }),
    );
    expect(model.s.str.toApi().view()).toBe('asdf');
    expect(model.s.con1.toApi().view()).toBe(123);
    expect(model.view().str).toBe('asdf');
    expect(model.view().con1).toBe(123);
    expect(model.view().anyKeyAllowed).toBe(undefined);
  });

  test('uses global session ID by default', () => {
    const model = Model.create().setSchema(
      s.obj({
        id: s.str<string>('asdf'),
        num: s.con(123),
      }),
    );
    expect(model.api.r.get().node.id.sid).toBe(SESSION.GLOBAL);
    expect(model.api.r.get().get('id').node.id.sid).toBe(SESSION.GLOBAL);
    expect(model.api.r.get().get('num').node.id.sid).toBe(SESSION.GLOBAL);
  });

  test('allows to specify custom session ID', () => {
    const schema = s.obj({
      id: s.str<string>('asdf'),
      num: s.con(123),
    });
    const model = Model.create().setSchema(schema, false);
    expect(model.api.r.get().node.id.sid).toBe(model.clock.sid);
    expect(model.api.r.get().get('id').node.id.sid).toBe(model.clock.sid);
    expect(model.api.r.get().get('num').node.id.sid).toBe(model.clock.sid);
  });

  test('resets session ID to user specified', () => {
    const model = Model.create().setSchema(
      s.obj({
        id: s.str<string>('asdf'),
        num: s.con(123),
      }),
    );
    expect(model.view().num).toBe(123);
    expect(model.api.r.get().get('num').node.id.sid).toBe(SESSION.GLOBAL);
    model.api.r.get().set({
      num: 456,
    });
    expect(model.view().num).toBe(456);
    expect(model.api.r.get().get('num').node.id.sid).not.toBe(SESSION.GLOBAL);
  });
});

describe('.create<Schema>()', () => {
  test('infers schema from a pojo', () => {
    const model = Model.create({
      key1: 'value1',
      key2: {
        key3: [{
          foo: 'bar',
        }],
      },
    });
    expect(model.$.key2.key3[0].foo.$?.view()).toBe('bar');
  });

  test('when schema not set, does not strictly type accessor', () => {
    const model = Model.create(void 0);
    expect(model.$.key2.key3[0].foo.$?.view()).toBe(undefined);
  });
});
