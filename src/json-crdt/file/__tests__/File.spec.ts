import {s} from '../../../json-crdt-patch';
import {Model} from '../../model';
import {File} from '../File';

test('can create File from new model', () => {
  const model = Model.withServerClock()
    .setSchema(s.obj({
      foo: s.str('bar'),
    }));
  const file = File.fromModel(model);
  expect(file.history.start.view()).toBe(undefined);
  expect(file.model.view()).toEqual({
    foo: 'bar',
  });
  expect(file.history.start.clock.sid).toBe(file.model.clock.sid);
});

test.todo('patches are flushed and stored in memory');
test.todo('can replay history');
