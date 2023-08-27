import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';
import {booleanOperators} from './boolean';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
  ...booleanOperators,
];

export const operatorsMap = operatorsToMap(operators);
