import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
];

export const operatorsMap = operatorsToMap(operators);
