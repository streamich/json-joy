import {Model} from '../../model';
import {PatchLog} from '../PatchLog';

const setup = (view: unknown) => {
  const model = Model.withServerClock();
  model.api.root(view);
  const log = PatchLog.fromNewModel(model);
  return {log};
};

test('can replay to specific patch', () => {
  const {log} = setup({foo: 'bar'});
  const model = log.end.clone();
  model.api.obj([]).set({x: 1});
  const patch1 = model.api.flush();
  model.api.obj([]).set({y: 2});
  const patch2 = model.api.flush();
  log.end.applyPatch(patch1);
  log.end.applyPatch(patch2);
  const model2 = log.replayToEnd();
  const model3 = log.replayTo(patch1.getId()!);
  const model4 = log.replayTo(patch2.getId()!);
  expect(model.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(log.end.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(log.start().view()).toEqual(undefined);
  expect(model2.view()).toEqual({foo: 'bar', x: 1, y: 2});
  expect(model3.view()).toEqual({foo: 'bar', x: 1});
  expect(model4.view()).toEqual({foo: 'bar', x: 1, y: 2});
});
