import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';
import {logicalOperators} from './logical';
import {typeOperators} from './type';
import {stringOperators} from './string';
import {branchingOperators} from './branching';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
  ...logicalOperators,
  ...typeOperators,
  ...stringOperators,
  ...branchingOperators,
];

export const operatorsMap = operatorsToMap(operators);
