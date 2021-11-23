import {evaluate} from '../evaluate';

test('can pick from data', () => {
  const data = {
    a: {
      b: {
        c: 1,
      },
    },
  };
  const expression = ['=', '/a/b/c'];
  const res = evaluate(expression, data);
  expect(res).toBe(1);
});
