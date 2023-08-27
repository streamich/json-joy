import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';
import {booleanOperators} from './boolean';
import {typeOperators} from './type';
import {stringOperators} from './string';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
  ...booleanOperators,
  ...typeOperators,
  ...stringOperators,
];

export const operatorsMap = operatorsToMap(operators);
