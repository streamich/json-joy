import {LogicalVectorClock} from '../../../../json-crdt-patch/clock';
import {Model} from '../../../model';
import {Encoder} from '../Encoder';

describe('logical', () => {
  test('encodes an empty document', () => {
    const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
    const encoder = new Encoder();
    const res = encoder.encode(doc);
    expect(res).toEqual([[123, 0], [0], 0]);
  });

  test('can encode object and array', () => {
    const doc = Model.withLogicalClock(new LogicalVectorClock(123, 0));
    const encoder = new Encoder();
    doc.api
      .root({
        arr: [false],
      })
      .commit();
    const res = encoder.encode(doc);
    expect(res).toEqual([[123, 4], -1, 0, [0, -1, 4, 'arr', -1, 1, [1, -1, 3, -1, 2, [2]]]]);
  });
});

describe('server', () => {
  test('encodes an empty document', () => {
    const doc = Model.withServerClock();
    const encoder = new Encoder();
    const res = encoder.encode(doc);
    expect(res).toEqual([0, [0], 0]);
  });
  
  test('can encode object and array', () => {
    const doc = Model.withServerClock();
    const encoder = new Encoder();
    doc.api
      .root({
        arr: [false],
      })
      .commit();
    const res = encoder.encode(doc);
    expect(res).toEqual([5, 1, [0, 5, 'arr', 2, [1, 4, 3, [2]]]]);
  });
});
