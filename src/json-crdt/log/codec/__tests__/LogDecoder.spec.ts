import {Log} from '../../Log';
import {Model} from '../../../model';
import {logEncoderOpts} from '../logEncoderOpts';
import {type EncodingParams, LogEncoder} from '../LogEncoder';
import {LogDecoder} from '../LogDecoder';
import {logDecoderOpts} from '../logDecoderOpts';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.set(view);
  const log = Log.fromNewModel(model);
  const encoder = new LogEncoder(logEncoderOpts);
  const decoder = new LogDecoder(logDecoderOpts);
  return {model, log, encoder, decoder};
};

describe('can decode from blob', () => {
  test('.ndjson', () => {
    const {log, encoder, decoder} = setup({foo: 'bar'});
    const blob = encoder.encode(log, {format: 'ndjson', model: 'compact', history: 'compact'});
    const decoded = decoder.decode(blob, {format: 'ndjson', frontier: true, history: true});
    const {frontier, history} = decoded;
    expect(frontier!.end.view()).toEqual({foo: 'bar'});
    expect(frontier!.end !== log.end).toBe(true);
    expect(history!.start().view()).toEqual(undefined);
    expect(history!.end.view()).toEqual({foo: 'bar'});
  });

  test('.seq.cbor', () => {
    const {log, encoder, decoder} = setup({foo: 'bar'});
    const blob = encoder.encode(log, {format: 'seq.cbor', model: 'binary', history: 'binary'});
    const decoded = decoder.decode(blob, {format: 'seq.cbor', frontier: true, history: true});
    const {frontier, history} = decoded;
    expect(frontier!.end.view()).toEqual({foo: 'bar'});
    expect(frontier!.end !== log.end).toBe(true);
    expect(history!.start().view()).toEqual(undefined);
    expect(history!.end.view()).toEqual({foo: 'bar'});
  });

  test('can store custom metadata keys', () => {
    const {log, encoder, decoder} = setup({foo: 'bar'});
    const metadata = {
      baz: 'qux',
      time: 123,
      active: true,
    };
    log.metadata = {...metadata};
    const blob = encoder.encode(log, {format: 'seq.cbor'});
    const decoded1 = decoder.decode(blob, {format: 'seq.cbor', frontier: true, history: true});
    expect(decoded1.frontier?.metadata).toEqual(metadata);
    expect(decoded1.history?.metadata).toEqual(metadata);
  });
});

const assertEncoding = (log: Log, params: EncodingParams) => {
  const encoder = new LogEncoder(logEncoderOpts);
  const decoder = new LogDecoder(logDecoderOpts);
  const encoded = encoder.encode(log, params);
  const decoded = decoder.decode(encoded, {
    format: params.format,
    frontier: true,
    history: true,
  });
  expect(decoded.frontier!.end.view()).toEqual(log.end.view());
  expect(decoded.frontier!.end !== log.end).toBe(true);
  expect(decoded.history!.start().view()).toEqual(undefined);
  expect(decoded.history!.replayToEnd().view()).toEqual(log.end.view());
  expect(decoded.history!.patches.size()).toBe(log.patches.size());
};

describe('can encode/decode all format combinations', () => {
  const formats: EncodingParams['format'][] = ['ndjson', 'seq.cbor'];
  const modelFormats: EncodingParams['model'][] = ['sidecar', 'binary', 'compact', 'verbose'];
  const historyFormats: EncodingParams['history'][] = ['binary', 'compact', 'verbose'];
  const noViews = [true, false];
  for (const format of formats) {
    for (const model of modelFormats) {
      for (const history of historyFormats) {
        for (const noView of noViews) {
          if (noView && model === 'sidecar') continue;
          const params = {format, model, history, noView};
          test(JSON.stringify(params), () => {
            const {log} = setup({foo: 'bar'});
            assertEncoding(log, params);
          });
        }
      }
    }
  }
});

describe('.deserialize()', () => {
  test('applies frontier', () => {
    const {log, model, encoder, decoder} = setup({foo: 'bar'});
    const clone = model.clone();
    clone.api.obj([]).set({
      xyz: 123,
    });
    const serialized = encoder.serialize(log, {
      history: 'binary',
    });
    serialized.push(clone.api.flush().toBinary());
    expect(log.end.view()).toEqual({foo: 'bar'});
    const deserialized1 = decoder.deserialize(serialized, {frontier: true});
    const deserialized2 = decoder.deserialize(serialized, {history: true});
    expect(deserialized1.frontier!.end.view()).toEqual({foo: 'bar', xyz: 123});
    expect(deserialized2.history!.end.view()).toEqual({foo: 'bar', xyz: 123});
  });
});
