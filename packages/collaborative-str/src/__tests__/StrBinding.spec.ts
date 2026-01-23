import {Model} from 'json-joy/lib/json-crdt';
import {StrBinding} from '../StrBinding';
import {MemoryEditor0, MemoryEditor1} from '../MemoryEditor';

describe('.set()', () => {
  test('syncs model to editor on init', () => {
    const model = Model.create();
    model.api.root({str: 'start'});
    const str = () => model.api.str(['str']);
    const editor = new MemoryEditor0();
    expect(editor.__str).toBe('');
    const unbind = StrBinding.bind(str, editor);
    expect(editor.__str).toBe('start');
    unbind();
  });
});

describe('.ins() and .del()', () => {
  test('syncs model to editor on startup using granular methods', () => {
    const model = Model.create();
    model.api.root({str: 'start'});
    const str = () => model.api.str(['str']);
    const editor = new MemoryEditor1();
    expect(editor.__str).toBe('');
    const unbind = StrBinding.bind(str, editor);
    expect(editor.__str).toBe('start');
    unbind();
  });

  test('syncs model to editor on startup using granular methods', () => {
    const model = Model.create();
    model.api.root({str: 'abc def ghi'});
    const str = () => model.api.str(['str']);
    const editor = new MemoryEditor1();
    editor.__str = 'abc edf x';
    const unbind = StrBinding.bind(str, editor);
    expect(editor.__str).toBe('abc def ghi');
    unbind();
  });
});
