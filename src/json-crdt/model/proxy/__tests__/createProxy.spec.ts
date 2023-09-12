import {Model} from '../../Model';
import {ViewToProxy} from '../types';

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
    coords: [1, 2],
  };
  const model = Model.withLogicalClock() as Model<View>;
  model.api.root(view);
  expect(model.find.id.toView()).toBe(view.id);
  expect(model.find.tags.toView()).toStrictEqual(view.tags);
});
