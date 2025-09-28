import {JsonPathEval} from "../JsonPathEval";
import {JsonPathParser} from "../JsonPathParser";

const data0 = {
  store: {
    book: [
      { title: 'Harry Potter', author: 'J.K. Rowling' },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien' }
    ]
  }
};

describe('selector', () => {
  describe('named', () => {
    test('basic object selection', () => {
      const expr = '$.store.book[0].title';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result).toMatchObject([
        {
          data: 'Harry Potter',
        },
      ]);
      expect(result[0].path()).toEqual(['$', 'store', 'book', 0, 'title']);
      expect(result[0].pointer()).toBe("$['store']['book'][0]['title']");
    });
  });
});

