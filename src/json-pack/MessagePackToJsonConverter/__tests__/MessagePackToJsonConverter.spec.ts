import {documents} from '../../../util/__tests__/json-documents';
import {MessagePackToJsonConverter} from '..';
import {EncoderFull} from '../../EncoderFull';

const encoder = new EncoderFull();
const converter = new MessagePackToJsonConverter();

for (const doc of documents) {
  (doc.only ? test.only : test)(doc.name, () => {
    const msgpack = encoder.encode(doc.json);
    const json = converter.convert(msgpack);
    const parsed = JSON.parse(json);
    expect(parsed).toStrictEqual(doc.json);
  });
}