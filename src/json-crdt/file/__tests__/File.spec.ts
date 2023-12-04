import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {File} from '../File';
import {JsonDecoder} from '../../../json-pack/json/JsonDecoder';
import {CborDecoder} from '../../../json-pack/cbor/CborDecoder';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
  const file = File.fromModel(model);
  return {model, file};
};

test('can create File from new model', () => {
  const model = Model.withServerClock().setSchema(
    s.obj({
      foo: s.str('bar'),
    }),
  );
  const file = File.fromModel(model);
  expect(file.history.start.view()).toBe(undefined);
  expect(file.model.view()).toEqual({
    foo: 'bar',
  });
  expect(file.history.start.clock.sid).toBe(file.model.clock.sid);
});

test.todo('patches are flushed and stored in memory');
test.todo('can replay history');

describe('.toBinary()', () => {
  describe('can read first value as view', () => {
    test('.ndjson', () => {
      const {file} = setup({foo: 'bar'});
      const blob = file.toBinary({format: 'ndjson', model: 'compact', history: 'compact'});
      const decoder = new JsonDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });

    test('.seq.cbor', () => {
      const {file} = setup({foo: 'bar'});
      const blob = file.toBinary({format: 'seq.cbor'});
      const decoder = new CborDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });
  });
});
