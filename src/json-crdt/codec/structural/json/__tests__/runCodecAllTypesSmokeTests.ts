import {konst} from '../../../../../json-crdt-patch/builder/Konst';
import {vec} from '../../../../../json-crdt-patch/builder/Tuple';
import {Timestamp} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';

export const runCodecAllTypesSmokeTests = (assertCodec: (doc: Model) => void) => {
  test('number', () => {
    const model = Model.withLogicalClock();
    model.api.root(123);
    assertCodec(model);
  });

  test('const number', () => {
    const model = Model.withLogicalClock();
    model.api.root(konst(123));
    assertCodec(model);
  });

  test('number with server clock', () => {
    const model = Model.withServerClock();
    model.api.root([1, 0, -4, 1.132, 8324.234234, 888888888888]);
    assertCodec(model);
  });

  test('string', () => {
    const model = Model.withLogicalClock();
    model.api.root(['', 'abc', '😛']);
    assertCodec(model);
  });

  test('boolean', () => {
    const model = Model.withLogicalClock();
    model.api.root([true, false]);
    assertCodec(model);
  });

  test('tuple', () => {
    const model = Model.withLogicalClock();
    model.api.root(vec(1, 2, 3));
    assertCodec(model);
  });

  test('null', () => {
    const model = Model.withLogicalClock();
    model.api.root(null);
    assertCodec(model);
  });

  test('object', () => {
    const model = Model.withLogicalClock();
    model.api.root({foo: 'bar', empty: {}});
    assertCodec(model);
  });
};
