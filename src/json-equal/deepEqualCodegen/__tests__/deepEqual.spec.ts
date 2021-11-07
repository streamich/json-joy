import {deepEqualCodegen} from '..';
import {runDeepEqualTestSuite} from '../../deepEqual/__tests__/runDeepEqualTestSuite';

const deepEqual = (a: unknown, b: unknown) => {
  const js = deepEqualCodegen(a);
  const fn = eval(js);
  return fn(b);
};

runDeepEqualTestSuite(deepEqual);
