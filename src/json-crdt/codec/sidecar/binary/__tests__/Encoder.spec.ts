import {s} from '../../../../../json-crdt-patch';
import {CborDecoder} from '../../../../../json-pack/cbor/CborDecoder';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';

test('con', () => {
  const model = Model.withLogicalClock();
  const encoder = new Encoder();
  const decoder = new Decoder();
  const cborDecoder = new CborDecoder();
  model.api.root(s.con(123));
  const [view, meta] = encoder.encode(model);
  const viewDecoded = cborDecoder.decode(view);
  const decoded = decoder.decode(viewDecoded, meta);
  expect(model.view()).toEqual(decoded.view());
  expect(model.view()).toEqual(viewDecoded);
  expect(decoded.clock.sid).toBe(model.clock.sid);
  expect(decoded.clock.time).toBe(model.clock.time);
});

// test('con', () => {
//   const model = Model.withLogicalClock();
//   const encoder = new Encoder();
//   const decoder = new Decoder();
//   const cborDecoder = new CborDecoder();
//   model.api.root(s.con(123));

//   console.log(model + '');

//   const [view, meta] = encoder.encode(model);

//   console.log(view);
//   console.log(meta);

//   const viewDecoded = cborDecoder.decode(view);
//   const decoded = decoder.decode(viewDecoded, meta);

//   console.log(viewDecoded);
//   console.log(decoded + '');

// });
