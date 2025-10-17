import {IonEncoderFast} from '../IonEncoderFast';
import {IonDecoder} from '../IonDecoder';
import {load} from 'ion-js';
import {documents} from '../../__tests__/json-documents';

const encoder = new IonEncoderFast();
const decoder = new IonDecoder();

for (const t of documents) {
  (t.only ? test.only : test)(t.name, () => {
    const encoded = encoder.encode(t.json);
    // console.log(encoded);
    const decoded = decoder.decode(encoded);
    expect(decoded).toEqual(t.json);
    const decoded2 = load(encoded);
    const pojo = JSON.parse(JSON.stringify(decoded2));
    expect(pojo).toEqual(t.json);
  });
}
