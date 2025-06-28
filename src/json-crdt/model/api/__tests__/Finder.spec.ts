import {Model} from '../../Model';

test('can find element by JSON Pointer', () => {
  const doc = Model.withLogicalClock();
  doc.api.set({
    foo: {
      bar: [
        {
          a: 123,
        },
      ],
    },
  });
  const val = doc.api.find('/foo/bar/0/a');
  expect(val.view()).toBe(123);
});
