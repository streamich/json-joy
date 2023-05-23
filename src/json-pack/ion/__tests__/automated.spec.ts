import {IonEncoderFast} from '../IonEncoderFast';
import {load} from 'ion-js';
import {documents} from '../../../__tests__/json-documents';

const encoder = new IonEncoderFast();

for (const t of documents) {
  (t.only ? test.only : test)(t.name, () => {
    const encoded = encoder.encode(t.json);
    // console.log(encoded);
    const decoded = load(encoded);
    const pojo = JSON.parse(JSON.stringify(decoded));
    expect(pojo).toEqual(t.json);
  });
}
