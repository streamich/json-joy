import {JsonPathCodegen} from '../JsonPathCodegen';
import {testJsonPathExec} from './testJsonPathExec';

describe('JsonPathCodegen', () => {
  testJsonPathExec(JsonPathCodegen.run);
});
