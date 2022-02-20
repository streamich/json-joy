import {$$deepEqual} from '..';
import {RandomJson} from '../../../json-random/RandomJson';

const deepEqual = (a: unknown, b: unknown) => {
  const js = $$deepEqual(a);
  const fn = eval(js); // tslint:disable-line
  return fn(b);
};

for (let i = 0; i < 100; i++) {
  const json1 = RandomJson.generate();
  const json2 = JSON.parse(JSON.stringify(json1));

  test('iteration ' + (i + 1), () => {
    const res1 = deepEqual(json1, json1);
    const res2 = deepEqual(json1, json2);
    const res3 = deepEqual(json2, json1);
    expect(res1).toBe(true);
    expect(res2).toBe(true);
    expect(res3).toBe(true);
  });
}
