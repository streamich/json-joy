// import {s} from '../../../json-crdt-patch';
import {Model} from '../../../model';
import {JsonDecoder} from '@jsonjoy.com/json-pack/lib/json/JsonDecoder';
import {logEncoderOpts} from '../logEncoderOpts';
import {LogEncoder} from '../LogEncoder';
import {Log} from '../../Log';
import {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.set(view);
  const log = Log.fromNewModel(model);
  const encoder = new LogEncoder(logEncoderOpts);
  return {model, log, encoder};
};

describe('.toBinary()', () => {
  describe('can read first value as view', () => {
    test('.ndjson', () => {
      const {encoder, log} = setup({foo: 'bar'});
      const blob = encoder.encode(log, {format: 'ndjson', model: 'compact', history: 'compact'});
      const decoder = new JsonDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });

    test('.seq.cbor', () => {
      const {encoder, log} = setup({foo: 'bar'});
      const blob = encoder.encode(log, {format: 'seq.cbor'});
      const decoder = new CborDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });
  });
});
