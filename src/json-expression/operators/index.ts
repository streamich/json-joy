import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';

export const operators = [
  ...arithmeticOperators,
];

export const operatorsMap = operatorsToMap(operators);
