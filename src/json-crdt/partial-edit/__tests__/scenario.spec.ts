import {PartialEditFactory} from '../PartialEditFactory';
import {Encoder} from '../../codec/indexed/binary/Encoder';
import {Decoder} from '../../codec/indexed/binary/Decoder';
import {Model} from '../../model';
import type {FieldName, IndexedNodeFields} from '../../codec/indexed/binary/types';

const encoder = new Encoder();
const decoder = new Decoder();

test('two concurrent users can apply partial updates', () => {
  const doc1 = Model.withLogicalClock();
  doc1.api.set({
    id: 123,
    name: 'John',
    verified: false,
    about: 'I am John',
  });
  const fields = encoder.encode(doc1);

  const doc2 = decoder.decode(fields).fork();
  doc2.api.str('/about').ins(9, '!');
  const patch1 = doc2.api.flush();
  doc2.api.obj([]).set({name: 'Johnny Bravo'});
  const patch2 = doc2.api.flush();
  expect(doc2.view()).toStrictEqual({
    id: 123,
    name: 'Johnny Bravo',
    verified: false,
    about: 'I am John!',
  });

  const doc3 = decoder.decode(fields).fork();
  const str = doc3.api.str('/about');
  str.del(2, 2);
  str.ins(2, 'was');
  doc3.api.obj([]).set({verified: true});
  const patch3 = doc3.api.builder.flush();
  expect(doc3.view()).toStrictEqual({
    id: 123,
    name: 'John',
    verified: true,
    about: 'I was John',
  });

  const factory = new PartialEditFactory(decoder, encoder);

  const edit1 = factory.startPartialEdit(fields.c);
  edit1.populateLoadList(patch1);
  edit1.populateLoadList(patch2);
  const edit1Fields = edit1.getFieldsToLoad();
  const list1 = Array.from(edit1Fields) as FieldName[];
  const loadedFields1: IndexedNodeFields = {};
  for (const field of list1) loadedFields1[field] = fields[field];
  edit1.loadPartialModel(loadedFields1);
  edit1.applyPatch(patch1);
  edit1.applyPatch(patch2);
  edit1.populateClockTable();
  const edits = edit1.getFieldEdits();
  Object.assign(fields, edits.updates);
  for (const field of edits.deletes) delete fields[field];
  const doc4 = decoder.decode(fields);
  expect(doc4.view()).toStrictEqual({
    id: 123,
    name: 'Johnny Bravo',
    verified: false,
    about: 'I am John!',
  });

  doc3.applyPatch(patch1);
  doc3.applyPatch(patch2);
  expect(doc3.view()).toStrictEqual({
    id: 123,
    name: 'Johnny Bravo',
    verified: true,
    about: 'I was John!',
  });

  const edit2 = factory.startPartialEdit(fields.c);
  edit2.populateLoadList(patch3);
  const edit2Fields = edit2.getFieldsToLoad();
  const list2 = Array.from(edit2Fields) as FieldName[];
  const loadedFields2: IndexedNodeFields = {};
  for (const field of list2) loadedFields2[field] = fields[field];

  edit2.loadPartialModel(loadedFields2);
  edit2.applyPatch(patch3);
  edit2.populateClockTable();
  const edits2 = edit2.getFieldEdits();
  Object.assign(fields, edits2.updates);
  for (const field of edits2.deletes) delete fields[field];
  const doc5 = decoder.decode(fields);
  expect(doc5.view()).toStrictEqual({
    id: 123,
    name: 'Johnny Bravo',
    verified: true,
    about: 'I was John!',
  });

  doc2.applyPatch(patch3);
  expect(doc2.view()).toStrictEqual({
    id: 123,
    name: 'Johnny Bravo',
    verified: true,
    about: 'I was John!',
  });
});
