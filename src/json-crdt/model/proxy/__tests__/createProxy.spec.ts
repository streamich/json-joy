import {tup} from '../../../../json-crdt-patch';
import {Model} from '../../Model';
import {ArrayApi, ConstApi, ObjectApi, StringApi, ValueApi} from '../../api/nodes';

test('creates a proxy for medium complexity object', () => {
  type View = {
    id: string,
    tags: Array<{
      id: string;
      title: string;
      value: number;
    }>,
    validation: {
      year: string;
      month: string;
    },
    coords: [x: number, y: number];
    verified?: boolean;
    scores: number[];
  };
  const view: View = {
    id: '123',
    tags: [
      {id: '1', title: 'tag1', value: 1},
      {id: '2', title: 'tag2', value: 2},
    ],
    validation: {
      year: '2020',
      month: '12',
    },
    coords: tup([1, 2]) as any,
    verified: true,
    scores: [1, 2, 3],
  };
  const model = Model.withLogicalClock() as Model<View>;
  model.api.root(view);

  expect(model.find.id.toView()).toBe(view.id);
  expect(model.find.id.toNode().view()).toBe(view.id);
  expect(model.find.id.toNode()).toBeInstanceOf(StringApi);

  expect(model.find.tags.toView()).toStrictEqual(view.tags);
  expect(model.find.tags.toNode().view()).toStrictEqual(view.tags);
  expect(model.find.tags.toNode()).toBeInstanceOf(ArrayApi);

  expect(model.find.tags[0].toView()).toStrictEqual(view.tags[0]);
  expect(model.find.tags[0].toNode().view()).toStrictEqual(view.tags[0]);
  expect(model.find.tags[0].toNode()).toBeInstanceOf(ObjectApi);

  expect(model.find.tags[1].toView()).toStrictEqual(view.tags[1]);
  expect(model.find.tags[1].toNode().view()).toStrictEqual(view.tags[1]);
  expect(model.find.tags[1].toNode()).toBeInstanceOf(ObjectApi);

  expect(model.find.tags[1].value.toView()).toStrictEqual(view.tags[1].value);
  expect(model.find.tags[1].value.toNode().view()).toStrictEqual(view.tags[1].value);
  expect(model.find.tags[1].value.toNode()).toBeInstanceOf(ConstApi);

  expect(model.find.verified?.toView()).toStrictEqual(view.verified);
  expect(model.find.verified?.toNode().view()).toStrictEqual(view.verified);
  expect(model.find.verified?.toNode()).toBeInstanceOf(ConstApi);

  expect(model.find.scores.toView()).toStrictEqual(view.scores);
  expect(model.find.scores.toNode().view()).toStrictEqual(view.scores);
  expect(model.find.scores.toNode()).toBeInstanceOf(ArrayApi);

  expect(model.find.scores[0].toView()).toStrictEqual(view.scores[0]);
  expect(model.find.scores[0].toNode().view()).toStrictEqual(view.scores[0]);
  expect(model.find.scores[0].toNode()).toBeInstanceOf(ValueApi);

  expect(model.find.scores[0].val.toView()).toStrictEqual(view.scores[0]);
  // expect(model.find.scores[0].val.toView()).toStrictEqual(view.scores[0]);
  // expect(model.find.scores[0].toNode().view()).toStrictEqual(view.scores[0]);
  // expect(model.find.scores[0].toNode()).toBeInstanceOf(ValueApi);
});
