import {OpAdd} from '../../../json-patch/op';
import {Model} from '../../model/Model';
import {JsonPatch} from '../JsonPatch';

describe('add', () => {
  test('can set the root value', () => {
    const model = new Model();
    const jsonPatch = new JsonPatch(model);
    const draft = jsonPatch.createDraft([new OpAdd([], true)]);
    const patch = draft.patch(model.clock);
    model.applyPatch(patch);
    model.applyPatch(patch);
    expect(model.toJson()).toBe(true);
  });

  test('can set the string as root value', () => {
    const model = new Model();
    const jsonPatch = new JsonPatch(model);
    const draft = jsonPatch.createDraft([new OpAdd([], 'hello world')]);
    const patch = draft.patch(model.clock);
    model.applyPatch(patch);
    model.applyPatch(patch);
    expect(model.toJson()).toBe('hello world');
  });

  test('can set object as root value', () => {
    const model = new Model();
    const jsonPatch = new JsonPatch(model);
    const draft = jsonPatch.createDraft([new OpAdd([], {a: [1, null]})]);
    const patch = draft.patch(model.clock);
    model.applyPatch(patch);
    model.applyPatch(patch);
    expect(model.toJson()).toEqual({a: [1, null]});
  });

  test('can set object as root value', () => {
    const model = new Model();
    const jsonPatch = new JsonPatch(model);
    jsonPatch.applyPatch([{op: 'add', path: '', value: {foo: {}}}]);
    jsonPatch.applyPatch([{op: 'add', path: '/foo/bar', value: 123}]);
    expect(model.toJson()).toEqual({foo: {bar: 123}});
  });
});
