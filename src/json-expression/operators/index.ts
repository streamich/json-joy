import {operatorsToMap} from '../util';
import {arithmeticOperators} from './arithmetic';
import {comparisonOperators} from './comparison';
import {logicalOperators} from './logical';
import {typeOperators} from './type';
import {containerOperators} from './container';
import {stringOperators} from './string';
import {binaryOperators} from './binary';
import {arrayOperators} from './array';
import {objectOperators} from './object';
import {branchingOperators} from './branching';
import {inputOperators} from './input';
import {bitwiseOperators} from './bitwise';
import {patchOperators} from './patch';

export const operators = [
  ...arithmeticOperators,
  ...comparisonOperators,
  ...logicalOperators,
  ...typeOperators,
  ...containerOperators,
  ...stringOperators,
  ...binaryOperators,
  ...arrayOperators,
  ...objectOperators,
  ...branchingOperators,
  ...inputOperators,
  ...bitwiseOperators,
  ...patchOperators,
];

export const operatorsMap = operatorsToMap(operators);
