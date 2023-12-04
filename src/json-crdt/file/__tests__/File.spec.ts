import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {File} from '../File';
import {JsonDecoder} from '../../../json-pack/json/JsonDecoder';
import {CborDecoder} from '../../../json-pack/cbor/CborDecoder';
import {FileEncodingParams} from '../types';

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
  expect(file.log.start.view()).toBe(undefined);
  expect(file.model.view()).toEqual({
    foo: 'bar',
  });
  expect(file.log.start.clock.sid).toBe(file.model.clock.sid);
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

  describe('can decode from blob', () => {
    test('.ndjson', () => {
      const {file} = setup({foo: 'bar'});
      const blob = file.toBinary({format: 'ndjson', model: 'compact', history: 'compact'});
      const file2 = File.fromNdjson(blob);
      expect(file2.model.view()).toEqual({foo: 'bar'});
      expect(file2.model !== file.model).toBe(true);
      expect(file.log.start.view()).toEqual(undefined);
      expect(file.log.replayToEnd().view()).toEqual({foo: 'bar'});
    });

    test('.seq.cbor', () => {
      const {file} = setup({foo: 'bar'});
      const blob = file.toBinary({format: 'seq.cbor', model: 'binary', history: 'binary'});
      const file2 = File.fromSeqCbor(blob);
      expect(file2.model.view()).toEqual({foo: 'bar'});
      expect(file2.model !== file.model).toBe(true);
      expect(file.log.start.view()).toEqual(undefined);
      expect(file.log.replayToEnd().view()).toEqual({foo: 'bar'});
    });
  });

  const assertEncoding = (file: File, params: FileEncodingParams) => {
    const blob = file.toBinary(params);
    // if (params.format === 'ndjson') console.log(Buffer.from(blob).toString('utf8'))
    const file2 = params.format === 'seq.cbor' ? File.fromSeqCbor(blob) : File.fromNdjson(blob);
    expect(file2.model.view()).toEqual(file.model.view());
    expect(file2.model !== file.model).toBe(true);
    expect(file2.log.start.view()).toEqual(undefined);
    expect(file2.log.replayToEnd().view()).toEqual(file.model.view());
    expect(file2.log.patches.size()).toBe(file.log.patches.size());
  };

  describe('can encode/decode all format combinations', () => {
    const formats: FileEncodingParams['format'][] = ['ndjson', 'seq.cbor'];
    const modelFormats: FileEncodingParams['model'][] = ['sidecar', 'binary', 'compact', 'verbose'];
    const historyFormats: FileEncodingParams['history'][] = ['binary', 'compact', 'verbose'];
    const noViews = [true, false];
    for (const format of formats) {
      for (const model of modelFormats) {
        for (const history of historyFormats) {
          for (const noView of noViews) {
            if (noView && model === 'sidecar') continue;
            const params = {format, model, history, noView};
            test(JSON.stringify(params), () => {
              const {file} = setup({foo: 'bar'});
              assertEncoding(file, params);
            });
          }
        }
      }
    }
  });
});

describe('.unserialize()', () => {
  test('applies frontier', () => {
    const {file, model} = setup({foo: 'bar'});
    const clone = model.clone();
    clone.api.obj([]).set({
      xyz: 123,
    });
    const serialized = file.serialize({
      history: 'binary',
    });
    serialized.push(clone.api.flush().toBinary());
    expect(file.model.view()).toEqual({foo: 'bar'});
    const file2 = File.unserialize(serialized);
    expect(file2.model.view()).toEqual({foo: 'bar', xyz: 123});
  });
});

describe('.sync()', () => {
  test('keeps track of local changes', async () => {
    const {file, model} = setup({foo: 'bar'});
    file.sync();
    model.api.obj([]).set({x: 1});
    await Promise.resolve();
    expect(file.model.view()).toEqual({foo: 'bar', x: 1});
    expect(file.log.replayToEnd().view()).toEqual({foo: 'bar', x: 1});
  });

  test('keeps track of remote changes', async () => {
    const {file, model} = setup({foo: 'bar'});
    const clone = model.clone();
    file.sync();
    clone.api.obj([]).set({x: 1});
    expect(clone.view()).toEqual({foo: 'bar', x: 1});
    expect(file.model.view()).toEqual({foo: 'bar'});
    const patch = clone.api.flush();
    file.model.applyPatch(patch);
    await Promise.resolve();
    expect(file.model.view()).toEqual({foo: 'bar', x: 1});
    expect(file.log.replayToEnd().view()).toEqual({foo: 'bar', x: 1});
  });
});
