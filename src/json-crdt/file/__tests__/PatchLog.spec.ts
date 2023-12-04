import {Model} from '../../model';
import {File} from '../File';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
  const file = File.fromModel(model);
  return {model, file};
};

test('can replay to specific patch', () => {
  const {file} = setup({foo: 'bar'});
  const model = file.model.clone();
  model.api.obj([]).set({x: 1});
  const patch1 = model.api.flush();
  model.api.obj([]).set({y: 2});
  const patch2 = model.api.flush();
  file.apply(patch1);
  file.apply(patch2);
  const model2 = file.log.replayToEnd();
  const model3 = file.log.replayTo(patch1.getId()!);
  const model4 = file.log.replayTo(patch2.getId()!);
  expect(model.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(file.model.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(file.log.start.view()).toEqual(undefined);
  expect(model2.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(model3.view()).toEqual({foo: 'bar', x: 1});
  expect(model4.view()).toEqual({foo: 'bar', x: 1, y: 2});
});
