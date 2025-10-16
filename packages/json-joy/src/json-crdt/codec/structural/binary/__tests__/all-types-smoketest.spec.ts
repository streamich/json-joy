import {Model} from '../../../../model';
import {runCodecAllTypesSmokeTests} from '../../verbose/__tests__/runCodecAllTypesSmokeTests';
import {ViewDecoder} from '../ViewDecoder';

const assertCodec = (doc: Model) => {
  const encoded = doc.toBinary();
  const decoded = Model.fromBinary(encoded);
  expect(doc.view()).toEqual(decoded.view());
  expect(doc.toString()).toEqual(decoded.toString());
};

const view = new ViewDecoder();

const assertViewCodec = (doc: Model) => {
  const encoded = doc.toBinary();
  const decoded = view.decode(encoded);
  expect(doc.view()).toEqual(decoded);
};

describe('full decoder', () => {
  runCodecAllTypesSmokeTests(assertCodec);
});

describe('view decoder', () => {
  runCodecAllTypesSmokeTests(assertViewCodec);
});
