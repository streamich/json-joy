import {JsonPathEval} from '../JsonPathEval';
import {testJsonPathExec} from './testJsonPathExec';

describe('JsonPathEval', () => {
  testJsonPathExec(JsonPathEval.run);
});
