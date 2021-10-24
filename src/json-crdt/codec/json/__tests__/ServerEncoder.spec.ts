import {Model} from '../../../model';
import {ServerEncoder} from '../ServerEncoder';

test('encodes an empty document', () => {
  const doc = Model.withServerClock(0);
  const encoder = new ServerEncoder();
  const res = encoder.encode(doc);
  expect(res).toEqual({time: 0, root: {type: 'root', id: 0, node: null}});
});

test('encodes deleted string chunks', () => {
  const doc = Model.withServerClock(0);
  const encoder = new ServerEncoder();
  doc.api.root('abc').commit();
  doc.api.strDel([], 1, 1).commit();
  const res = encoder.encode(doc);
  expect(res).toEqual({
    time: 6,
    root: {
      type: 'root',
      id: 4,
      node: {
        type: 'str',
        id: 0,
        chunks: [
          {
            id: 1,
            value: 'a',
          },
          {
            id: 2,
            span: 1,
          },
          {
            id: 3,
            value: 'c',
          },
        ],
      },
    },
  });
});
