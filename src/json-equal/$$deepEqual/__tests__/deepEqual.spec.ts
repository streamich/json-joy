import {$$deepEqual} from '..';
import {runDeepEqualTestSuite} from '../../deepEqual/__tests__/runDeepEqualTestSuite';

const deepEqual = (a: unknown, b: unknown) => {
  const js = $$deepEqual(a);
  const fn = eval(js); // tslint:disable-line
  return fn(b);
};

runDeepEqualTestSuite(deepEqual);
