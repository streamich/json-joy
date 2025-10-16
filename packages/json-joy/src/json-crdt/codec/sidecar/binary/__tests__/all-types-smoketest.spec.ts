import type {Model} from '../../../../model';
import {runCodecAllTypesSmokeTests} from '../../../structural/verbose/__tests__/runCodecAllTypesSmokeTests';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';

const encoder = new Encoder();
const decoder = new Decoder();
const cborDecoder = new CborDecoder();

const assertCodec = (doc: Model) => {
  const [view, sidecar] = encoder.encode(doc);
  const decoded = decoder.decode(cborDecoder.read(view), sidecar);
  expect(doc.view()).toEqual(decoded.view());
};

runCodecAllTypesSmokeTests(assertCodec);
