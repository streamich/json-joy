import {$$deepEqual} from '..';
import {runDeepEqualTestSuite} from '../../deepEqual/__tests__/runDeepEqualTestSuite';

const deepEqual = (a: unknown, b: unknown) => {
  const js = $$deepEqual(a);
  const fn = eval(js);
  return fn(b);
};

runDeepEqualTestSuite(deepEqual);
