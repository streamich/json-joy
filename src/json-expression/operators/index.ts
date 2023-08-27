import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';
import {booleanOperators} from './boolean';
import {typeOperators} from './type';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
  ...booleanOperators,
  ...typeOperators,
];

export const operatorsMap = operatorsToMap(operators);
