import {JsonPathEval} from "../JsonPathEval";
import {JsonPathParser} from "../JsonPathParser";

const data0 = {
  store: {
    book: [
      { title: 'Harry Potter', author: 'J.K. Rowling', price: 8.95 },
      { title: 'The Hobbit', author: 'J.R.R. Tolkien', price: 12.99 }
    ],
    bicycle: {
      color: 'red',
      price: 399
    }
  }
};

const arrayData = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const complexData = {
  a: [3, 5, 1, 2, 4, 6,
      {"b": "j"},
      {"b": "k"},
      {"b": {}},
      {"b": "kilo"}
     ],
  o: {"p": 1, "q": 2, "r": 3, "s": 5, "t": {"u": 6}},
  e: "f"
};

describe('JsonPathEval', () => {
  describe('named selector', () => {
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

    test('nested object access', () => {
      const expr = '$.store.bicycle.color';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('red');
    });

    test('nonexistent property', () => {
      const expr = '$.store.nonexistent';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });
  });

  describe('index selector', () => {
    test('positive array index', () => {
      const expr = '$[1]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('b');
    });

    test('negative array index', () => {
      const expr = '$[-2]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('f');
    });

    test('out of bounds index', () => {
      const expr = '$[10]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });

    test('negative out of bounds index', () => {
      const expr = '$[-10]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });
  });

  describe('wildcard selector', () => {
    test('wildcard on object', () => {
      const expr = '$.store[*]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      // Results should include both book array and bicycle object
      const values = result.map(r => r.data);
      expect(values).toContainEqual(data0.store.book);
      expect(values).toContainEqual(data0.store.bicycle);
    });

    test('wildcard on array', () => {
      const expr = '$[*]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(arrayData.length);
      // Array elements should be in order
      for (let i = 0; i < arrayData.length; i++) {
        expect(result[i].data).toBe(arrayData[i]);
      }
    });

    test('wildcard on primitive', () => {
      const expr = '$[*]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, 'hello');
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });
  });

  describe('slice selector', () => {
    test('basic slice [1:3]', () => {
      const expr = '$[1:3]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('b');
      expect(result[1].data).toBe('c');
    });

    test('slice with no end [5:]', () => {
      const expr = '$[5:]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('f');
      expect(result[1].data).toBe('g');
    });

    test('slice with step [1:5:2]', () => {
      const expr = '$[1:5:2]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('b');
      expect(result[1].data).toBe('d');
    });

    test('slice with negative step [5:1:-2]', () => {
      const expr = '$[5:1:-2]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('f');
      expect(result[1].data).toBe('d');
    });

    test('reverse slice [::-1]', () => {
      const expr = '$[::-1]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(arrayData.length);
      // Should be in reverse order
      for (let i = 0; i < arrayData.length; i++) {
        expect(result[i].data).toBe(arrayData[arrayData.length - 1 - i]);
      }
    });

    test('slice with zero step', () => {
      const expr = '$[1:5:0]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });

    test('slice on non-array', () => {
      const expr = '$[1:3]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0.store);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });
  });

  describe('filter selector', () => {
    test('simple comparison filter', () => {
      const expr = '$.store.book[?@.price < 10]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe('Harry Potter');
    });

    test('equality comparison filter', () => {
      const expr = '$.a[?@.b == "k"]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, complexData);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect((result[0].data as any).b).toBe('k');
    });

    test.skip('existence filter - not yet supported by parser', () => {
      const expr = '$.a[?@.b]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, complexData);
      const result = evaluator.eval();
      expect(result.length).toBe(4); // All objects with property 'b'
    });

    test('array value comparison', () => {
      const expr = '$.a[?@ > 3.5]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, complexData);
      const result = evaluator.eval();
      const values = result.map(r => r.data);
      expect(values).toEqual([5, 4, 6]);
    });
  });

  describe('recursive descent selector', () => {
    test('descendant by name', () => {
      const expr = '$..price';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(3); // Two book prices + bicycle price
      const values = result.map(r => r.data);
      expect(values).toContain(8.95);
      expect(values).toContain(12.99);
      expect(values).toContain(399);
    });

    test('descendant by index', () => {
      const expr = '$..[0]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, data0);
      const result = evaluator.eval();
      expect(result.length).toBe(1); // Only book[0]
      expect((result[0].data as any).title).toBe('Harry Potter');
    });

    test('descendant wildcard', () => {
      const expr = '$..*';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, {a: {b: 1}, c: [2, 3]});
      const result = evaluator.eval();
      // Should select all descendant values
      expect(result.length).toBeGreaterThan(0);
      const values = result.map(r => r.data);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });
  });

  describe('combined selectors', () => {
    test('multiple selectors in brackets', () => {
      const expr = '$[0, 3]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('d');
    });

    test('slice and index combined', () => {
      const expr = '$[0:2, 5]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(3);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('b');
      expect(result[2].data).toBe('f');
    });

    test('duplicated entries', () => {
      const expr = '$[0, 0]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, arrayData);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('a');
    });
  });

  describe('edge cases', () => {
    test('empty array', () => {
      const expr = '$[*]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, []);
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });

    test('empty object', () => {
      const expr = '$[*]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, {});
      const result = evaluator.eval();
      expect(result.length).toBe(0);
    });

    test('null values', () => {
      const expr = '$.a';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, {a: null});
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect(result[0].data).toBe(null);
    });

    test('deeply nested structure', () => {
      const deep = {a: {b: {c: {d: {e: 'deep'}}}}};
      const expr = '$.a.b.c.d.e';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, deep);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('deep');
    });
  });

  describe('RFC 9535 compliance examples', () => {
    // Examples from RFC 9535 Table 2
    const bookstore = {
      "store": {
        "book": [
          { "category": "reference", "author": "Nigel Rees", "title": "Sayings of the Century", "price": 8.95 },
          { "category": "fiction", "author": "Evelyn Waugh", "title": "Sword of Honour", "price": 12.99 },
          { "category": "fiction", "author": "Herman Melville", "title": "Moby Dick", "isbn": "0-553-21311-3", "price": 8.99 },
          { "category": "fiction", "author": "J. R. R. Tolkien", "title": "The Lord of the Rings", "isbn": "0-395-19395-8", "price": 22.99 }
        ],
        "bicycle": { "color": "red", "price": 399 }
      }
    };

    test('$.store.book[*].author - the authors of all books in the store', () => {
      const expr = '$.store.book[*].author';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(4);
      const authors = result.map(r => r.data);
      expect(authors).toContain("Nigel Rees");
      expect(authors).toContain("Evelyn Waugh");
      expect(authors).toContain("Herman Melville");
      expect(authors).toContain("J. R. R. Tolkien");
    });

    test('$..author - all authors', () => {
      const expr = '$..author';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(4);
    });

    test('$.store.* - all things in the store', () => {
      const expr = '$.store.*';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(2); // book array and bicycle object
    });

    test('$..book[2] - the third book', () => {
      const expr = '$..book[2]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe("Moby Dick");
    });

    test('$..book[-1] - the last book', () => {
      const expr = '$..book[-1]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe("The Lord of the Rings");
    });

    test('$..book[0,1] - the first two books', () => {
      const expr = '$..book[0,1]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect((result[0].data as any).title).toBe("Sayings of the Century");
      expect((result[1].data as any).title).toBe("Sword of Honour");
    });

    test('$..book[:2] - the first two books', () => {
      const expr = '$..book[:2]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      expect((result[0].data as any).title).toBe("Sayings of the Century");
      expect((result[1].data as any).title).toBe("Sword of Honour");
    });

    test.skip('$..book[?@.isbn] - all books with an ISBN number - not yet supported by parser', () => {
      const expr = '$..book[?@.isbn]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      const titles = result.map(r => (r.data as any).title);
      expect(titles).toContain("Moby Dick");
      expect(titles).toContain("The Lord of the Rings");
    });

    test('$..book[?@.price<10] - all books cheaper than 10', () => {
      const expr = '$..book[?@.price < 10]';
      const ast = JsonPathParser.parse(expr);
      const evaluator = new JsonPathEval(ast.path!, bookstore);
      const result = evaluator.eval();
      expect(result.length).toBe(2);
      const titles = result.map(r => (r.data as any).title);
      expect(titles).toContain("Sayings of the Century");
      expect(titles).toContain("Moby Dick");
    });
  });
});

