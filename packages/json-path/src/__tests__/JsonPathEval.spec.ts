import {JsonPathEval} from '../JsonPathEval';
import {arrayData, bookstore, complexData, data0, jsonpathDotComExample, testData} from './fixtures';

describe('JsonPathEval', () => {
  describe('named selector', () => {
    test('basic object selection', () => {
      const expr = '$.store.book[0].title';
      const result = JsonPathEval.run(expr, data0);
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
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('red');
    });

    test('nonexistent property', () => {
      const expr = '$.store.nonexistent';
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(0);
    });
  });

  describe('index selector', () => {
    test('positive array index', () => {
      const expr = '$[1]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('b');
    });

    test('negative array index', () => {
      const expr = '$[-2]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('f');
    });

    test('out of bounds index', () => {
      const expr = '$[10]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(0);
    });

    test('negative out of bounds index', () => {
      const expr = '$[-10]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(0);
    });
  });

  describe('wildcard selector', () => {
    test('wildcard on object', () => {
      const expr = '$.store[*]';
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(2);
      // Results should include both book array and bicycle object
      const values = result.map((r) => r.data);
      expect(values).toContainEqual(data0.store.book);
      expect(values).toContainEqual(data0.store.bicycle);
    });

    test('wildcard on array', () => {
      const expr = '$[*]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(arrayData.length);
      // Array elements should be in order
      for (let i = 0; i < arrayData.length; i++) {
        expect(result[i].data).toBe(arrayData[i]);
      }
    });

    test('wildcard on primitive', () => {
      const expr = '$[*]';
      const result = JsonPathEval.run(expr, 'hello');
      expect(result.length).toBe(0);
    });
  });

  describe('slice selector', () => {
    test('basic slice [1:3]', () => {
      const expr = '$[1:3]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('b');
      expect(result[1].data).toBe('c');
    });

    test('slice with no end [5:]', () => {
      const expr = '$[5:]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('f');
      expect(result[1].data).toBe('g');
    });

    test('slice with step [1:5:2]', () => {
      const expr = '$[1:5:2]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('b');
      expect(result[1].data).toBe('d');
    });

    test('slice with negative step [5:1:-2]', () => {
      const expr = '$[5:1:-2]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('f');
      expect(result[1].data).toBe('d');
    });

    test('reverse slice [::-1]', () => {
      const expr = '$[::-1]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(arrayData.length);
      // Should be in reverse order
      for (let i = 0; i < arrayData.length; i++) {
        expect(result[i].data).toBe(arrayData[arrayData.length - 1 - i]);
      }
    });

    test('slice with zero step', () => {
      const expr = '$[1:5:0]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(0);
    });

    test('slice on non-array', () => {
      const expr = '$[1:3]';
      const result = JsonPathEval.run(expr, data0.store);
      expect(result.length).toBe(0);
    });
  });

  describe('filter selector', () => {
    test('simple comparison filter', () => {
      const expr = '$.store.book[?@.price < 10]';
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe('Harry Potter');
    });

    test('equality comparison filter', () => {
      const expr = '$.a[?@.b == "k"]';
      const result = JsonPathEval.run(expr, complexData);
      expect(result.length).toBe(1);
      expect((result[0].data as any).b).toBe('k');
    });

    test('existence filter', () => {
      const expr = '$.a[?@.b]';
      const result = JsonPathEval.run(expr, complexData);
      expect(result.length).toBe(4); // All objects with property 'b'
    });

    test('array value comparison', () => {
      const expr = '$.a[?@ > 3.5]';
      const result = JsonPathEval.run(expr, complexData);
      const values = result.map((r) => r.data);
      expect(values).toEqual([5, 4, 6]);
    });
  });

  describe('recursive descent selector', () => {
    test('descendant by name', () => {
      const expr = '$..price';
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(3); // Two book prices + bicycle price
      const values = result.map((r) => r.data);
      expect(values).toContain(8.95);
      expect(values).toContain(12.99);
      expect(values).toContain(399);
    });

    test('descendant by index', () => {
      const expr = '$..[0]';
      const result = JsonPathEval.run(expr, data0);
      expect(result.length).toBe(1); // Only book[0]
      expect((result[0].data as any).title).toBe('Harry Potter');
    });

    test('descendant wildcard', () => {
      const expr = '$..*';
      const result = JsonPathEval.run(expr, {a: {b: 1}, c: [2, 3]});
      // Should select all descendant values
      expect(result.length).toBeGreaterThan(0);
      const values = result.map((r) => r.data);
      expect(values).toContain(1);
      expect(values).toContain(2);
      expect(values).toContain(3);
    });
  });

  describe('combined selectors', () => {
    test('multiple selectors in brackets', () => {
      const expr = '$[0, 3]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('d');
    });

    test('slice and index combined', () => {
      const expr = '$[0:2, 5]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(3);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('b');
      expect(result[2].data).toBe('f');
    });

    test('duplicated entries', () => {
      const expr = '$[0, 0]';
      const result = JsonPathEval.run(expr, arrayData);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('a');
      expect(result[1].data).toBe('a');
    });
  });

  describe('edge cases', () => {
    test('empty array', () => {
      const expr = '$[*]';
      const result = JsonPathEval.run(expr, []);
      expect(result.length).toBe(0);
    });

    test('empty object', () => {
      const expr = '$[*]';
      const result = JsonPathEval.run(expr, {});
      expect(result.length).toBe(0);
    });

    test('null values', () => {
      const expr = '$.a';
      const result = JsonPathEval.run(expr, {a: null});
      expect(result.length).toBe(1);
      expect(result[0].data).toBe(null);
    });

    test('deeply nested structure', () => {
      const deep = {a: {b: {c: {d: {e: 'deep'}}}}};
      const expr = '$.a.b.c.d.e';
      const result = JsonPathEval.run(expr, deep);
      expect(result.length).toBe(1);
      expect(result[0].data).toBe('deep');
    });
  });

  describe('real-world examples', () => {
    describe('jsonpath.com front page examples', () => {
      test('phone number type', () => {
        const expr = '$.phoneNumbers[:1].type';
        const result = JsonPathEval.run(expr, jsonpathDotComExample);
        expect(result.length).toBe(1);
        expect(result[0].data).toBe('iPhone');
        expect(result[0].pointer()).toBe("$['phoneNumbers'][0]['type']");
      });
    });

    describe('hevodata.com', () => {
      test('example from docs', () => {
        const expr = '$.event.data.name';
        const data = {
          "event": {
            "agency": "MI6",
            "data": {
              "name": "James Bond",
              "id": "007"
            }
          }
        };
        const result = JsonPathEval.run(expr, data);
        expect(result.length).toBe(1);
        expect(result[0].data).toBe('James Bond');
        expect(result[0].pointer()).toBe("$['event']['data']['name']");
      });
    });
  });

  describe('RFC 9535 compliance examples', () => {
    test('$.store.book[*].author - the authors of all books in the store', () => {
      const expr = '$.store.book[*].author';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(4);
      const authors = result.map((r) => r.data);
      expect(authors).toContain('Nigel Rees');
      expect(authors).toContain('Evelyn Waugh');
      expect(authors).toContain('Herman Melville');
      expect(authors).toContain('J. R. R. Tolkien');
    });

    test('$..author - all authors', () => {
      const expr = '$..author';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(4);
    });

    test('$.store.* - all things in the store', () => {
      const expr = '$.store.*';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(2); // book array and bicycle object
    });

    test('$..book[2] - the third book', () => {
      const expr = '$..book[2]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe('Moby Dick');
    });

    test('$..book[-1] - the last book', () => {
      const expr = '$..book[-1]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(1);
      expect((result[0].data as any).title).toBe('The Lord of the Rings');
    });

    test('$..book[0,1] - the first two books', () => {
      const expr = '$..book[0,1]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(2);
      expect((result[0].data as any).title).toBe('Sayings of the Century');
      expect((result[1].data as any).title).toBe('Sword of Honour');
    });

    test('$..book[:2] - the first two books', () => {
      const expr = '$..book[:2]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(2);
      expect((result[0].data as any).title).toBe('Sayings of the Century');
      expect((result[1].data as any).title).toBe('Sword of Honour');
    });

    test('$..book[?@.isbn] - all books with an ISBN number', () => {
      const expr = '$..book[?@.isbn]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(2);
      const titles = result.map((r) => (r.data as any).title);
      expect(titles).toContain('Moby Dick');
      expect(titles).toContain('The Lord of the Rings');
    });

    test('$..book[?@.price<10] - all books cheaper than 10', () => {
      const expr = '$..book[?@.price < 10]';
      const result = JsonPathEval.run(expr, bookstore);
      expect(result.length).toBe(2);
      const titles = result.map((r) => (r.data as any).title);
      expect(titles).toContain('Sayings of the Century');
      expect(titles).toContain('Moby Dick');
    });
  });

  describe('JSONPath function extensions (RFC 9535)', () => {
    describe('length() function', () => {
      test('length of string', () => {
        const expr = '$[?length(@.info.name) == 10]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('length of array', () => {
        const expr = '$[?length(@.authors) == 3]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('length of object', () => {
        const expr = '$[?length(@.info.contacts) == 2]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('length of array with books >= 4', () => {
        const expr = '$[?length(@.store.book) >= 4]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('length with non-existent property returns nothing', () => {
        const expr = '$[?length(@.nonexistent) == 0]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('length of primitive values returns nothing', () => {
        const expr = '$[?length(@.store.bicycle.price) == 0]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('length function with Unicode characters', () => {
        const unicodeData = {text: 'Hello 🌍 World'};
        const expr = '$[?length(@.text) == 13]';
        const result = JsonPathEval.run(expr, unicodeData);
        expect(result.length).toBe(1);
      });
    });

    describe('count() function', () => {
      test('count all books', () => {
        const expr = '$[?count(@.store.book[*]) == 4]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('count books with ISBN', () => {
        const expr = '$[?count(@.store.book[?@.isbn]) == 2]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('count all descendants', () => {
        const expr = '$[?count(@..*) > 20]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('count with empty result', () => {
        const expr = '$[?count(@.nonexistent[*]) == 0]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('count specific property occurrences', () => {
        const expr = '$[?count(@..price) == 5]'; // 4 books + 1 bicycle
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });
    });

    describe('match() function', () => {
      test('match exact string pattern', () => {
        const expr = '$.store.book[?match(@.category, "fiction")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(3); // Three fiction books
      });

      test('match with character class', () => {
        const expr = '$.store.book[?match(@.title, ".*Lord.*")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
        expect((result[0].data as any).title).toBe('The Lord of the Rings');
      });

      test('match ISBN pattern', () => {
        const expr = '$.store.book[?match(@.isbn, "[0-9]+-[0-9]+-[0-9]+-[0-9]+")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2);
      });

      test('match case sensitive', () => {
        const expr = '$.store.book[?match(@.category, "Fiction")]'; // Capital F
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('match with anchors', () => {
        const expr = '$.store.book[?match(@.author, ".*Tolkien")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('match non-string returns false', () => {
        const expr = '$.store.book[?match(@.price, "12\\.99")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0); // price is number, not string
      });

      test('match invalid regex returns false', () => {
        const expr = '$.store.book[?match(@.title, "[")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });
    });

    describe('search() function', () => {
      test('search substring in title', () => {
        const expr = '$.store.book[?search(@.title, "Lord")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
        expect((result[0].data as any).title).toBe('The Lord of the Rings');
      });

      test('search pattern in author names', () => {
        const expr = '$.store.book[?search(@.author, "[JE].*")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2); // J. R. R. Tolkien and Evelyn Waugh
      });

      test('search with character classes', () => {
        const expr = '$.store.book[?search(@.title, "[Ss]word")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
        expect((result[0].data as any).title).toBe('Sword of Honour');
      });

      test('search digit pattern', () => {
        const expr = '$.store.book[?search(@.isbn, "[0-9]+")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2);
      });

      test('search case insensitive-like pattern', () => {
        const expr = '$.store.book[?search(@.category, "[Ff]iction")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(3);
      });

      test('search non-string returns false', () => {
        const expr = '$.store.book[?search(@.price, "99")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('search with word boundaries', () => {
        const expr = '$.authors[?search(@, "^Bob$")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
        expect(result[0].data).toBe('Bob');
      });
    });

    describe('value() function', () => {
      test('value from single node', () => {
        const expr = '$[?value(@..color) == "red"]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('value from single price query', () => {
        const expr = '$.store.book[?value(@.price) < 10]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2);
      });

      test('value from multiple nodes returns nothing', () => {
        const expr = '$[?value(@..price) == 8.95]'; // Multiple prices exist
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0); // Should return nothing for multiple nodes
      });

      test('value from empty query returns nothing', () => {
        const expr = '$[?value(@.nonexistent) == null]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('value with specific property', () => {
        const expr = '$.store.book[?value(@.isbn) != null]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2);
      });
    });

    describe('combined function usage', () => {
      test('length and count together', () => {
        const expr = '$[?length(@.authors) == count(@.authors[*])]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('match and search difference', () => {
        const matchExpr = '$.store.book[?match(@.title, "Lord")]';
        const searchExpr = '$.store.book[?search(@.title, "Lord")]';

        const matchResult = JsonPathEval.run(matchExpr, testData);
        const searchResult = JsonPathEval.run(searchExpr, testData);

        expect(matchResult.length).toBe(0); // Exact match fails
        expect(searchResult.length).toBe(1); // Substring search succeeds
      });

      test('nested function calls', () => {
        const expr = '$[?count(@.store.book[?length(@.title) > 15]) == 2]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(1);
      });

      test('value with length filter', () => {
        const expr = '$.store.book[?length(value(@.title)) > 10]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(3); // All but "Moby Dick"
      });

      test('functions in logical expressions', () => {
        const expr = '$.store.book[?length(@.title) > 10 && search(@.category, "fiction")]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(2); // Sword of Honour and The Lord of the Rings
      });
    });

    describe('error cases and edge cases', () => {
      test('functions with wrong argument count', () => {
        const expr = '$[?length(@.name, @.other) == 5]'; // Wrong arg count
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('unknown function returns false', () => {
        const expr = '$[?unknown(@.name) == true]';
        const result = JsonPathEval.run(expr, testData);
        expect(result.length).toBe(0);
      });

      test('function with null values', () => {
        const nullData = {items: [null, '', 0, false]};
        const expr = '$.items[?length(@) == 0]';
        const result = JsonPathEval.run(expr, nullData);
        expect(result.length).toBe(1); // Only empty string has length 0
        expect(result[0].data).toBe('');
      });
    });
  });
});
