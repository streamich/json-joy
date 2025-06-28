import {s} from '../../../../../json-crdt-patch';
import {konst} from '../../../../../json-crdt-patch/builder/Konst';
import {Model} from '../../../../model';

export const runCodecAllTypesSmokeTests = (assertCodec: (doc: Model) => void) => {
  test('number', () => {
    const model = Model.create();
    model.api.set(123);
    assertCodec(model);
  });

  test('const number', () => {
    const model = Model.create();
    model.api.set(konst(123));
    assertCodec(model);
  });

  test('numbers with server clock', () => {
    const model = Model.withServerClock();
    model.api.set([1, 0, -4, 1.132, 8324.234234, 888888888888]);
    assertCodec(model);
  });

  test('strings', () => {
    const model = Model.create();
    model.api.set(['', 'abc', '😛']);
    assertCodec(model);
  });

  test('boolean', () => {
    const model = Model.create();
    model.api.set([true, false]);
    assertCodec(model);
  });

  test('tuple', () => {
    const model = Model.create();
    model.api.set(s.vec(s.con(1), s.con(2), s.con(3)));
    assertCodec(model);
  });

  test('null', () => {
    const model = Model.create();
    model.api.set(null);
    assertCodec(model);
  });

  test('object', () => {
    const model = Model.create();
    model.api.set({foo: 'bar', empty: {}});
    assertCodec(model);
  });

  test('vector', () => {
    const model = Model.create();
    model.api.set(s.vec(s.con(1), s.con(2), s.con(3)));
    assertCodec(model);
  });

  test('vector - with gaps', () => {
    const model = Model.create();
    model.api.set(s.vec(s.con(1)));
    model.api.vec([]).set([[2, s.con(3)]]);
    assertCodec(model);
  });
};
