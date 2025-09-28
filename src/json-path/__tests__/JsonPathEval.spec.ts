import {JsonPathEval} from "../JsonPathEval";
import {JsonPathParser} from "../JsonPathParser";

test('basic object selection', () => {
  const expr = '$.store.book[0].title';
  const ast = JsonPathParser.parse(expr);
  const data = {
    store: {
      book: [
        { title: 'Harry Potter', author: 'J.K. Rowling' },
        { title: 'The Hobbit', author: 'J.R.R. Tolkien' }
      ]
    }
  };
  const evaluator = new JsonPathEval(ast.path!, data);
  const result = evaluator.eval();
  expect(result).toMatchObject([
    {
      data: 'Harry Potter',
    },
  ]);
  expect(result[0].path()).toEqual(['$', 'store', 'book', 0, 'title']);
  expect(result[0].pointer()).toBe("$['store']['book'][0]['title']");
});
