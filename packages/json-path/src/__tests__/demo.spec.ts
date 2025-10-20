import {JsonPathEval} from '../JsonPathEval';
import {tsAst} from './fixtures';

test('TypeScript AST example', () => {
  const data = tsAst;
  const query = '$..[?@.type == "BinaryExpression" && @.operator == "+" && @..left.type == \'Identifier\'].range';
  const result = JsonPathEval.run(query, data);
  expect(result[0].pointer()).toBe("$['body'][3]['declaration']['body']['body'][1]['value']['body']['body'][4]['body']['body'][0]['expression']['right']['arguments'][1]['range']");
  expect(result[0].data).toEqual([455, 462]); 
  expect(result[1].pointer()).toBe("$['body'][3]['declaration']['body']['body'][1]['value']['body']['body'][4]['body']['body'][2]['expression']['arguments'][1]['range']");
  expect(result[1].data).toEqual([515, 522]); 
});
