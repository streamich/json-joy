import type {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {runCodecAllTypesSmokeTests} from '../../verbose/__tests__/runCodecAllTypesSmokeTests';

const encoder = new Encoder();
const decoder = new Decoder();

const assertCodec = (doc: Model) => {
  const encoded = encoder.encode(doc);
  const decoded = decoder.decode(encoded);
  expect(doc.view()).toEqual(decoded.view());
};

runCodecAllTypesSmokeTests(assertCodec);
