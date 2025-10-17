import {ClockVector} from '../../../../../json-crdt-patch/clock';
import {Model} from '../../../../model';
import {Encoder} from '../Encoder';
import {Decoder} from '../Decoder';

test('editing document ', () => {
  const encoder = new Encoder();
  const decoder = new Decoder();
  const doc1 = Model.create(void 0, new ClockVector(233322, 0));
  doc1.api.set({
    id: 123456,
    name: 'John',
    age: 23,
    aboutMe: 'I am a cool guy',
    friends: [
      {
        id: 123,
        name: 'John',
        age: 23,
        aboutMe: 'I am a cool guy',
      },
    ],
  });
  doc1.api.str(['aboutMe']).ins(15, '!');
  doc1.api.arr(['friends']).ins(0, [null]);
  doc1.api.arr(['friends']).ins(2, [false]);
  doc1.api.obj([]).set({id: '4'});
  const encoded1 = encoder.encode(doc1);
  const doc2 = decoder.decode(encoded1);
  const encoded2 = encoder.encode(doc2);
  const doc3 = decoder.decode(encoded2);
  const result = {
    id: '4',
    name: 'John',
    age: 23,
    aboutMe: 'I am a cool guy!',
    friends: [
      null,
      {
        id: 123,
        name: 'John',
        age: 23,
        aboutMe: 'I am a cool guy',
      },
      false,
    ],
  };
  expect(doc1.view()).toEqual(result);
  expect(doc2.view()).toEqual(result);
  expect(doc3.view()).toEqual(result);
});
