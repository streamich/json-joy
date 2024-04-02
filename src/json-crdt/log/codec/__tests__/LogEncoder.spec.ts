// import {s} from '../../../json-crdt-patch';
import {Model} from '../../../model';
import {JsonDecoder} from '../../../../json-pack/json/JsonDecoder';
import {logEncoderOpts} from '../logEncoderOpts';
import {LogEncoder} from '../LogEncoder';
import {Log} from '../../Log';
import {CborDecoder} from '../../../../json-pack/cbor/CborDecoder';
// import {CborDecoder} from '../../../json-pack/cbor/CborDecoder';
// import {FileEncodingParams} from '../types';
// import {fileEncoders} from '../fileEncoders';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
  const log = Log.fromNewModel(model);
  const encoder = new LogEncoder(logEncoderOpts);
  return {model, log, encoder};
};

describe('.toBinary()', () => {
  describe('can read first value as view', () => {
    test('.ndjson', () => {
      const {encoder, log} = setup({foo: 'bar'});
      const blob = encoder.toBinary(log, {format: 'ndjson', model: 'compact', history: 'compact'});
      const decoder = new JsonDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });

    test('.seq.cbor', () => {
      const {encoder, log} = setup({foo: 'bar'});
      const blob = encoder.toBinary(log, {format: 'seq.cbor'});
      const decoder = new CborDecoder();
      const view = decoder.read(blob);
      expect(view).toEqual({foo: 'bar'});
    });
  });

  // describe('can decode from blob', () => {
  //   test('.ndjson', () => {
  //     const {file} = setup({foo: 'bar'});
  //     const blob = file.toBinary({format: 'ndjson', model: 'compact', history: 'compact'});
  //     const file2 = File.fromNdjson(blob);
  //     expect(file2.model.view()).toEqual({foo: 'bar'});
  //     expect(file2.model !== file.model).toBe(true);
  //     expect(file.log.start().view()).toEqual(undefined);
  //     expect(file.log.replayToEnd().view()).toEqual({foo: 'bar'});
  //   });

  //   test('.seq.cbor', () => {
  //     const {file} = setup({foo: 'bar'});
  //     const blob = file.toBinary({format: 'seq.cbor', model: 'binary', history: 'binary'});
  //     const file2 = File.fromSeqCbor(blob);
  //     expect(file2.model.view()).toEqual({foo: 'bar'});
  //     expect(file2.model !== file.model).toBe(true);
  //     expect(file.log.start().view()).toEqual(undefined);
  //     expect(file.log.replayToEnd().view()).toEqual({foo: 'bar'});
  //   });
  // });

  // const assertEncoding = (file: File, params: FileEncodingParams) => {
  //   const blob = file.toBinary(params);
  //   // if (params.format === 'ndjson') console.log(Buffer.from(blob).toString('utf8'))
  //   const file2 =
  //     params.format === 'seq.cbor' ? File.fromSeqCbor(blob, fileEncoders) : File.fromNdjson(blob, fileEncoders);
  //   expect(file2.model.view()).toEqual(file.model.view());
  //   expect(file2.model !== file.model).toBe(true);
  //   expect(file2.log.start().view()).toEqual(undefined);
  //   expect(file2.log.replayToEnd().view()).toEqual(file.model.view());
  //   expect(file2.log.patches.size()).toBe(file.log.patches.size());
  // };

  // describe('can encode/decode all format combinations', () => {
  //   const formats: FileEncodingParams['format'][] = ['ndjson', 'seq.cbor'];
  //   const modelFormats: FileEncodingParams['model'][] = ['sidecar', 'binary', 'compact', 'verbose'];
  //   const historyFormats: FileEncodingParams['history'][] = ['binary', 'compact', 'verbose'];
  //   const noViews = [true, false];
  //   for (const format of formats) {
  //     for (const model of modelFormats) {
  //       for (const history of historyFormats) {
  //         for (const noView of noViews) {
  //           if (noView && model === 'sidecar') continue;
  //           const params = {format, model, history, noView};
  //           test(JSON.stringify(params), () => {
  //             const {file} = setup({foo: 'bar'});
  //             assertEncoding(file, params);
  //           });
  //         }
  //       }
  //     }
  //   }
  // });
});

// describe('.unserialize()', () => {
//   test('applies frontier', () => {
//     const {file, model} = setup({foo: 'bar'});
//     const clone = model.clone();
//     clone.api.obj([]).set({
//       xyz: 123,
//     });
//     const serialized = file.serialize({
//       history: 'binary',
//     });
//     serialized.push(clone.api.flush().toBinary());
//     expect(file.model.view()).toEqual({foo: 'bar'});
//     const file2 = File.unserialize(serialized, fileEncoders);
//     expect(file2.model.view()).toEqual({foo: 'bar', xyz: 123});
//   });
// });
