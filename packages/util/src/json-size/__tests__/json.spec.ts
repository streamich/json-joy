import {jsonSize, jsonSizeApprox} from '../json';
import {testJsonSize} from './testJsonSize';

describe('jsonSize', () => {
  testJsonSize(jsonSize);
});

describe('jsonSizeApprox', () => {
  testJsonSize(jsonSizeApprox, {simpleStringsOnly: true});
});
