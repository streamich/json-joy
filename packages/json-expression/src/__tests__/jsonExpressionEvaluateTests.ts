import {Vars} from '../Vars';
import {evaluate} from '../evaluate';
import type {Expr} from '../types';
import type {Check} from './jsonExpressionCodegenTests';

export const jsonExpressionEvaluateTests = (check: Check) => {
  describe('Evaluate tests', () => {
    describe('get', () => {
      test('can pick from data', () => {
        const data = {
          a: {
            b: {
              c: 1,
            },
          },
        };
        const expression = ['$', '/a/b/c'];
        const res = evaluate(expression, {vars: new Vars(data)});
        expect(res).toBe(1);
      });

      test('can pick from data with "get" expression', () => {
        const data = {
          a: {
            b: {
              c: 1,
            },
          },
        };
        const expression = ['get', '/a/b/c'];
        const res = evaluate(expression, {vars: new Vars(data)});
        expect(res).toBe(1);
      });
    });

    describe('and', () => {
      test('works in base case', () => {
        check(['&&', true, true], true, null);
        check(['&&', true, false], false, null);
        check(['&&', false, true], false, null);
        check(['&&', false, false], false, null);
        check(['and', true, true], true, null);
        check(['and', true, false], false, null);
        check(['and', false, true], false, null);
        check(['and', false, false], false, null);
      });

      test('works with number', () => {
        check(['&&', 1, 1], 1, null);
        check(['&&', 1, 0], 0, null);
        check(['&&', 0, 1], 0, null);
        check(['&&', 0, 0], 0, null);
      });

      test('true on multiple truthy values', () => {
        const data = {
          true: true,
          false: false,
          one: 1,
          zero: 0,
        };
        check(['&&', ['$', '/true'], ['$', '/one'], ['$', '/true']], true, data);
        check(['&&', ['$', '/true'], ['$', '/one']], 1, data);
      });

      test('false on single falsy value', () => {
        const data = {
          true: true,
          false: false,
          one: 1,
          zero: 0,
        };
        check(['&&', ['$', '/true'], ['$', '/one'], ['$', '/zero']], 0, data);
      });
    });

    describe('eq', () => {
      test('equals return true', () => {
        const data = {
          true: true,
          false: false,
          one: 1,
          zero: 0,
        };
        check(['eq', ['$', '/true'], true], true, data);
        check(['eq', {foo: 'bar'}, {foo: 'bar'}], true, data);
        check(['==', {foo: 'bar'}, {foo: 'bar'}], true, data);
        check(['eq', {foo: 'bar'}, {foo: 'baz'}], false, data);
        check(['==', {foo: 'bar'}, {foo: 'baz'}], false, data);
      });
    });

    describe('in', () => {
      test('can deeply match one of multiple values', () => {
        const data = {
          contentType: 'application/json',
          data: {
            foo: 'bar',
          },
        };
        check(['in', [['application/octet-stream', 'application/json']], ['get', '/contentType']], true, data);
        check(['in', [['application/json']], ['get', '/contentType']], true, data);
        check(['in', [['application/octet-stream', 'application/json2']], ['get', '/contentType']], false, data);
        check(['in', [[{}]], ['get', '/data']], false, data);
        check(['in', [[{foo: 'bar'}]], ['get', '/data']], true, data);
      });
    });

    describe('ne', () => {
      test('equals return true', () => {
        const data = {
          true: true,
          false: false,
          one: 1,
          zero: 0,
        };
        check(['ne', ['$', '/true'], true], false, data);
        check(['ne', {foo: 'bar'}, {foo: 'bar'}], false, data);
        check(['!=', {foo: 'bar'}, {foo: 'bar'}], false, data);
        check(['ne', {foo: 'bar'}, {foo: 'baz'}], true, data);
        check(['!=', {foo: 'bar'}, {foo: 'baz'}], true, data);
      });
    });

    describe('if', () => {
      test('works', () => {
        const data = {
          true: true,
          false: false,
          one: 1,
          zero: 0,
        };
        check(['if', true, ['$', '/one'], ['$', '/true']], 1, data);
        check(['if', false, ['$', '/one'], ['$', '/true']], true, data);
        check(['?', true, '1', '2'], '1', data);
        check(['?', 0, '1', '2'], '2', data);
        check(['?', ['get', '/true'], '1', '2'], '1', data);
      });
    });

    describe('or', () => {
      test('works in base case', () => {
        check(['||', true, true], true, null);
        check(['||', true, false], true, null);
        check(['||', false, true], true, null);
        check(['||', false, false], false, null);
        check(['or', true, true], true, null);
        check(['or', true, false], true, null);
        check(['or', false, true], true, null);
        check(['or', false, false], false, null);
      });
    });

    describe('not', () => {
      test('works in base case', () => {
        check(['!', true], false, null);
        check(['!', false], true, null);
        check(['not', true], false, null);
        check(['not', false], true, null);
      });
    });

    describe('type', () => {
      test('returns value types', () => {
        check(['type', null], 'null');
        check(['type', 123], 'number');
        check(['type', [[]]], 'array');
        check(['type', {}], 'object');
        check(['type', ''], 'string');
        check(['type', false], 'boolean');
      });
    });

    describe('defined', () => {
      test('works', () => {
        const data = {foo: 'bar'};
        check(['$?', '/foo'], true, data);
        check(['get?', '/foo2'], false, data);
      });
    });

    describe('bool', () => {
      test('converts value to boolean', () => {
        check(['bool', null], false);
        check(['bool', 123], true);
      });
    });

    describe('num', () => {
      test('converts value to number', () => {
        check(['num', '123.4'], 123.4);
        check(['num', {}], 0);
      });
    });

    describe('str', () => {
      test('converts value to string', () => {
        check(['str', 123], '123');
      });
    });

    describe('starts', () => {
      test('returns true when string starts with another sub-string', () => {
        const data = {a: 'asdf', b: 'as'};
        check(['starts', 'asdf', ['$', '/b']], true, data);
        check(['starts', ['$', '/a'], ['$', '/b']], true, data);
        check(['starts', ['$', '/b'], ['$', '/b']], true, data);
        check(['starts', 'gg', ['$', '/b']], false, data);
        check(['starts', ['$', '/b'], ['$', '/a']], false, data);
      });
    });

    describe('contains', () => {
      test('returns true when string contains another string', () => {
        const data = {a: 'asdf', b: 'as'};
        check(['contains', '123456789', '456'], true, data);
        check(['contains', '123456789', '1'], true, data);
        check(['contains', '123456789', '9'], true, data);
        check(['contains', '123456789', 'df'], false, data);
      });
    });

    describe('ends', () => {
      test('returns true when string ends with give sub-string', () => {
        const data = {a: 'asdf', b: 'as'};
        check(['ends', '123456789', '789'], true, data);
        check(['ends', '123456789', '9'], true, data);
        check(['ends', '123456789', '78'], false, data);
      });
    });

    describe('cat', () => {
      test('works', () => {
        check(['cat', '789', '123456789'], '789123456789');
        check(['.', '789', '123456789'], '789123456789');
        check(['.', '1', 'a', 'gg'], '1agg');
      });
    });

    describe('substr', () => {
      test('works', () => {
        check(['substr', '12345', 1, 1 + 2], '23');
      });
    });

    describe('<', () => {
      test('works', () => {
        check(['<', 1, 2], true);
        check(['<', 1, 1.1], true);
        check(['<', 1, 1], false);
      });
    });

    describe('<=', () => {
      test('works', () => {
        check(['<=', 1, 2], true);
        check(['<=', 1, 1], true);
        check(['<=', 1, 0], false);
      });
    });

    describe('>', () => {
      test('works', () => {
        check(['>', 2, 1], true);
        check(['>', 1, 1], false);
      });
    });

    describe('>=', () => {
      test('works', () => {
        check(['>=', 2, 1], true);
        check(['>=', 1, 1], true);
        check(['>=', 0, 1], false);
      });
    });

    describe('min', () => {
      test('works', () => {
        check(['min', 2, 1], 1);
        check(['min', '2', 1], 1);
      });
    });

    describe('max', () => {
      test('works', () => {
        check(['max', 2, 1], 2);
        check(['max', '2', 1], 2);
      });
    });

    describe('+', () => {
      test('works', () => {
        check(['+', 2, 1, 3], 6);
        check(['+', 2, 1, 3.1], 6.1);
      });
    });

    describe('-', () => {
      test('works', () => {
        check(['-', 2, 1], 1);
        check(['-', 5, 1], 4);
        check(['-', 5, 1, 3], 1);
      });
    });

    describe('*', () => {
      test('works', () => {
        check(['*', 2, 1], 2);
        check(['*', 1, 2, 3], 6);
      });
    });

    describe('/', () => {
      test('works', () => {
        check(['/', 6, 2], 3);
      });
    });

    describe('%', () => {
      test('works', () => {
        check(['%', 6, 2], 0);
        check(['%', 6, 4], 2);
      });
    });

    describe('scenarios', () => {
      test('can filter messages', () => {
        const data = {
          chan: 'slides-123',
          data: {
            type: 'cursor-move',
            username: 'uk/hardy',
            pos: [309, 123],
          },
        };

        const expression1: Expr = [
          'and',
          ['==', ['get', '/chan'], 'slides-123'],
          ['==', ['get', '/data/type'], 'cursor-move'],
          ['>', ['$', '/data/pos/0'], 300],
          ['starts', ['$', '/data/username'], 'uk/'],
        ];
        check(expression1, true, data);

        const expression2: Expr = [
          'and',
          ['==', ['get', '/chan'], 'slides-123'],
          ['==', ['get', '/data/type'], 'cursor-move'],
          ['>', ['$', '/data/pos/1'], 555],
          ['starts', ['$', '/data/username'], 'uk/'],
        ];
        check(expression2, false, data);
      });

      describe('feature parity with AWS SNS filtering policies (https://docs.aws.amazon.com/sns/latest/dg/sns-subscription-filter-policies.html)', () => {
        //   {
        //     "store": ["example_corp"],
        //     "event": [{"anything-but": "order_cancelled"}],
        //     "customer_interests": [
        //        "rugby",
        //        "football",
        //        "baseball"
        //     ],
        //     "price_usd": [{"numeric": [">=", 100]}]
        //  }
        test('can work as AWS sample filtering policy - 1', () => {
          const data = {
            store: 'example_corp',
            event: 'order_created',
            customer_interests: 'football',
            price_usd: 105.95,
          };

          const expression1: Expr = [
            'and',
            ['==', ['get', '/store'], 'example_corp'],
            ['!', ['==', ['get', '/event'], 'order_cancelled']],
            ['in', [['rugby', 'football', 'baseball']], ['get', '/customer_interests']],
            ['>=', ['$', '/price_usd'], 100],
          ];
          check(expression1, true, data);

          const expression2: Expr = [
            'and',
            ['==', ['get', '/store'], 'some_other_example_corp'],
            ['!', ['==', ['get', '/event'], 'order_cancelled']],
            ['in', [['rugby', 'football', 'baseball']], ['get', '/customer_interests']],
            ['>=', ['$', '/price_usd'], 100],
          ];
          check(expression2, false, data);
        });

        // "key_b": ["value_one"],
        test('can match a single value', () => {
          const data = {
            key_b: 'value_one',
          };
          check(['==', ['get', '/key_b'], 'value_one'], true, data);
          check(['==', ['get', '/key_b'], 'value_two'], false, data);
        });

        // "key_a": ["value_one", "value_two", "value_three"],
        test('can match multiple values', () => {
          const data = {
            key_a: 'value_three',
          };
          check(['in', [['value_one', 'value_two', 'value_three']], ['get', '/key_a']], true, data);
          check(['in', [['value_one', 'value_two', 'value_four']], ['get', '/key_a']], false, data);
        });

        // "price": {"Type": "Number.Array", "Value": "[100, 50]"}
        test('can match value in array', () => {
          const data = {
            price: [100, 50],
          };
          check(['in', ['$', '/price'], 100], true, data);
          check(['in', ['$', '/price'], 50], true, data);
          check(['in', ['$', '/price'], 1], false, data);
        });

        // "customer_interests": [{"prefix": "bas"}]
        test('can match by prefix', () => {
          const data = {
            customer_interests: 'baseball',
          };
          check(['starts', ['get', '/customer_interests'], 'bas'], true, data);
          check(['starts', ['get', '/customer_interests'], 'rug'], false, data);
        });

        // "customer_interests": [{"anything-but": ["rugby", "tennis"]}]
        test('anything but', () => {
          const data = {
            customer_interests: 'rugby',
          };
          check(['!', ['in', [['rugby', 'tennis']], ['get', '/customer_interests']]], false, data);
          check(['not', ['in', [['football', 'tennis']], ['get', '/customer_interests']]], true, data);
        });

        // "event": [{"anything-but": {"prefix":"order-"}}]
        test('anything but with prefix', () => {
          const data = {
            event: 'order-return',
          };
          check(['!', ['starts', ['get', '/event'], 'order-']], false, data);
          check(['not', ['starts', ['get', '/event'], 'log-']], true, data);
        });

        // "source_ip": [{"cidr": "10.0.0.0/24"}]
        // xtest('IP address matching', () => {
        // const data = {
        //   source_ip: '10.0.0.255',
        // };
        // check(['cidr', '10.0.0.0/24', ['get', '/source_ip']], true, data);
        // });

        // "price_usd": [{"numeric": [">", 0, "<=", 150]}]
        // xtest('between operator', () => {
        // const data = {
        //   price_usd: 100,
        // };
        // check(['><=', 0, 150, ['/price_usd']], true, data);
        // });

        // "store": [{"exists": true}]
        // "store": [{"exists": false}]
        test('attribute key matching', () => {
          const data = {
            store: 'Halloween Inc',
          };
          check(['$?', '/store'], true, data);
          check(['get?', '/foo'], false, data);
          check(['!', ['$?', '/store']], false, data);
          check(['!', ['$?', '/foo']], true, data);
        });
      });
    });
  });
};
