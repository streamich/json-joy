import {documents} from '../../__tests__/json-documents';
import {MsgPackToJsonConverter} from '../MsgPackToJsonConverter';
import {MsgPackEncoder} from '../MsgPackEncoder';

const encoder = new MsgPackEncoder();
const converter = new MsgPackToJsonConverter();

for (const doc of documents) {
  (doc.only ? test.only : test)(doc.name, () => {
    const msgpack = encoder.encode(doc.json);
    const json = converter.convert(msgpack);
    const parsed = JSON.parse(json);
    expect(parsed).toStrictEqual(doc.json);
  });
}
