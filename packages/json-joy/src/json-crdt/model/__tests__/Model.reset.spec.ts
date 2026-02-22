import {until} from '../../../__tests__/util';
import {schema} from '../../../json-crdt-patch';
import {Model} from '../Model';

describe('reset()', () => {
  test('resets model state', () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    expect(doc2.view()).toEqual({text: 'hello world'});
    doc1.reset(doc2);
    expect(doc1.view()).toStrictEqual(doc2.view());
    expect(doc1.view()).toStrictEqual({text: 'hello world'});
    expect(doc1.view()).not.toBe(doc2.view());
    expect(doc1.clock.sid).toBe(doc2.clock.sid);
    expect(doc1.clock.time).toBe(doc2.clock.time);
    expect(doc1.clock).not.toBe(doc2.clock);
    expect(doc1.ext).not.toBe(doc2.ext);
    expect(doc1.index).not.toBe(doc2.index);
    expect(doc1.toString()).toBe(doc2.toString());
  });

  test('models can be edited separately', () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    doc2.reset(doc1);
    doc2.api.obj([]).set({foo: 'bar', qux: 42});
    expect(doc1.view()).toStrictEqual({foo: 123});
    expect(doc2.view()).toStrictEqual({foo: 'bar', qux: 42});
    expect(doc1.clock.sid).toBe(doc2.clock.sid);
    expect(doc1.clock.time).not.toBe(doc2.clock.time);
    expect(doc1.clock).not.toBe(doc2.clock);
  });

  test('emits change event on reset', async () => {
    const doc1 = Model.create();
    const doc2 = Model.create();
    doc1.api.set({foo: 123});
    doc2.api.set({
      text: 'hello',
    });
    doc2.api.str(['text']).ins(5, ' world');
    let cnt = 0;
    doc2.api.onChanges.listen(() => cnt++);
    doc2.reset(doc1);
    await until(() => cnt > 0);
    expect(cnt).toBe(1);
  });

  test('preserves API nodes when model is reset', async () => {
    const doc1 = Model.create().setSchema(
      schema.obj({
        text: schema.str('hell'),
      }),
    );
    const doc2 = doc1.fork();
    doc2.s.text.$.ins(4, 'o');
    const str = doc1.s.text.$;
    expect(str === doc2.s.text.$).toBe(false);
    expect(str.view()).toBe('hell');
    doc1.reset(doc2);
    expect(str.view()).toBe('hello');
  });

  test('uses the same clock in Model and NodeBuilder', async () => {
    const doc1 = Model.create().setSchema(
      schema.obj({
        text: schema.str('hell'),
      }),
    );
    const doc2 = doc1.fork();
    doc2.s.text.$.ins(4, 'o');
    expect(doc1.clock).toBe(doc1.api.builder.clock);
    expect(doc2.clock).toBe(doc2.api.builder.clock);
    doc1.reset(doc2);
    expect(doc1.clock).toBe(doc1.api.builder.clock);
    expect(doc2.clock).toBe(doc2.api.builder.clock);
  });
});
