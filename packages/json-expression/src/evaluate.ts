import {createEvaluate} from './createEvaluate';
import {operatorsMap} from './operators';

export const evaluate = createEvaluate({
  operators: operatorsMap,
});
