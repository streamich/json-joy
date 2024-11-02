import {clone} from '@jsonjoy.com/util/lib/json-clone';
import {apply} from '../apply';
import {OpTree} from '../tree';
import type {JsonOp} from '../types';

test('can compose two operations', () => {
  const op1: JsonOp = [
    [],
    [
      [0, ['to', 'delete']],
      [1, ['this', 'will', 'move']],
      [2, ['this', 'will', 'copy']],
    ],
    [[3, 'aha']],
    [
      [1, ['this', 'will', 'move', 'here']],
      [2, ['this', 'will', 'copy']],
      [2, ['this', 'will', 'copy2']],
      [3, ['new', 'text']],
    ],
    [],
  ];

  const op2: JsonOp = [
    [],
    [
      [0, ['another', 'delete']],
      [1, ['another', 'move']],
    ],
    [
      [2, null],
      [3, false],
      [4, 'sub-value'],
    ],
    [
      [1, ['another', 'move-here']],
      [2, ['root-to-null']],
      [3, ['set', 'nested', 'value']],
      [4, ['to', 'delete', 'sub-value']],
    ],
    [],
  ];

  const tree1 = OpTree.from(op1);
  const tree2 = OpTree.from(op2);

  // console.log(tree1.toString());
  // console.log(tree2.toString());

  tree1.compose(tree2);

  // console.log(tree1.toString());

  // console.log(JSON.stringify(tree1.toJson(), null, 4));
});

test('can compose two empty operations', () => {
  const op1: JsonOp = [[]];
  const op2: JsonOp = [[]];
  const tree1 = OpTree.from(op1);
  const tree2 = OpTree.from(op2);
  tree1.compose(tree2);
  const op3 = tree1.toJson();
  expect(op3).toStrictEqual([[], [], [], [], []]);
});

test('can compose operation with empty operation', () => {
  const op1: JsonOp = [[]];
  const op2: JsonOp = [[], [], [[0, 123]], [[0, ['foo']]]];
  const tree1 = OpTree.from(op1);
  const tree2 = OpTree.from(op2);
  tree1.compose(tree2);
  const op3 = tree1.toJson();
  expect(op3).toStrictEqual([[], [], [[0, 123]], [[0, ['foo']]], []]);
});

test('composes when value just dropped is deleted', () => {
  const op1: JsonOp = [[], [], [[0, 123]], [[0, ['foo']]]];
  const op2: JsonOp = [[], [[0, ['foo']]]];
  const tree1 = OpTree.from(op1);
  const tree2 = OpTree.from(op2);
  tree1.compose(tree2);
  const op3 = tree1.toJson();
  expect(op3).toStrictEqual([[], [[1, ['foo']]], [], [], []]);
});

interface TestCase {
  name: string;
  op1: JsonOp;
  op2: JsonOp;
  doc: unknown;
  expected: unknown;
  only?: boolean;
}

interface TestSuite {
  name: string;
  tests: TestCase[];
}

const suite: TestSuite = {
  name: 'basic operation composition',
  tests: [
    {
      name: 'two unrelated inserts',
      op1: [[], [], [[0, 1]], [[0, ['a']]]],
      op2: [[], [], [[0, 2]], [[0, ['b']]]],
      doc: {},
      expected: {a: 1, b: 2},
    },
    {
      name: 'unrelated inserts and deletes',
      doc: {a: 1},
      op1: [[], [[0, ['a']]]],
      op2: [[], [], [[0, 2]], [[0, ['b']]]],
      expected: {b: 2},
    },
    {
      name: 'two inserts in the same key',
      doc: {},
      op1: [[], [], [[0, 1]], [[0, ['b']]]],
      op2: [[], [], [[0, 2]], [[0, ['b']]]],
      expected: {b: 2},
    },
    {
      name: 'two inserts in the same key (reversed)',
      doc: {},
      op1: [[], [], [[0, 2]], [[0, ['b']]]],
      op2: [[], [], [[0, 1]], [[0, ['b']]]],
      expected: {b: 1},
    },
    {
      name: 'insert child key into just inserted object',
      doc: {},
      op1: [[], [], [[0, {}]], [[0, ['a']]]],
      op2: [[], [], [[0, 'c']], [[0, ['a', 'b']]]],
      expected: {a: {b: 'c'}},
    },
    {
      name: 'two unrelated inserts multiple levels deep',
      doc: {
        a: {
          b: {
            c: {
              x: 1,
              y: 2,
            },
          },
        },
      },
      op1: [[], [], [[0, true]], [[0, ['a', 'b', 'c', 'x']]]],
      op2: [[], [], [[0, false]], [[0, ['a', 'b', 'c', 'y']]]],
      expected: {
        a: {
          b: {
            c: {
              x: true,
              y: false,
            },
          },
        },
      },
    },
    {
      name: 'unrelated insert and move deeply nested',
      doc: {
        a: {
          b: {
            c: {
              x: 1,
              y: 2,
            },
          },
        },
      },
      op1: [[], [[0, ['a', 'b', 'c', 'x']]], [], [[0, ['a', 'b', 'c', 'z']]]],
      op2: [[], [], [[0, false]], [[0, ['a', 'b', 'c', 'y']]]],
      expected: {
        a: {
          b: {
            c: {
              z: 1,
              y: false,
            },
          },
        },
      },
    },
    {
      name: 'deep move and then overwrite',
      doc: {
        a: {
          b: {
            c: {
              x: 1,
            },
          },
        },
      },
      op1: [[], [[0, ['a', 'b', 'c', 'x']]], [], [[0, ['a', 'b', 'c', 'z']]]],
      op2: [[], [], [[0, false]], [[0, ['a', 'b', 'c', 'z']]]],
      expected: {
        a: {
          b: {
            c: {
              z: false,
            },
          },
        },
      },
      // only: true,
    },
    {
      name: 'move and overwrite',
      doc: {
        a: 1,
      },
      op1: [[], [[0, ['a']]], [], [[0, ['b']]]],
      op2: [[], [], [[0, false]], [[0, ['b']]]],
      expected: {
        b: false,
      },
      // only: true,
    },
    {
      name: 'move and overwrite on different levels',
      doc: {
        x: 1,
        a: {
          y: 2,
        },
      },
      op1: [[], [[0, ['x']]], [], [[0, ['a', 'x']]]],
      op2: [[], [], [[0, 'gg']], [[0, ['a', 'x']]]],
      expected: {
        a: {
          y: 2,
          x: 'gg',
        },
      },
      // only: true,
    },
    {
      name: 'move to array and overwrite the value',
      doc: {
        val: null,
        arr: [],
      },
      op1: [[], [[0, ['val']]], [], [[0, ['arr', 0]]]],
      op2: [[], [[0, ['arr', 0]]], [[1, true]], [[1, ['arr', 0]]]],
      expected: {
        arr: [true],
      },
      // only: true,
    },
    {
      name: 'remove from moved array',
      doc: {
        arr1: [1, 2],
        arr2: [],
      },
      op1: [[], [[0, ['arr1']]], [], [[0, ['arr2', 0]]]],
      op2: [[], [[0, ['arr2', 0, 0]]]],
      expected: {
        arr2: [[2]],
      },
      // only: true,
    },
    {
      name: 'remove from moved object',
      doc: {
        test: {
          obj1: {
            a: 1,
            b: 2,
          },
          arr: [],
        },
      },
      op1: [[], [[0, ['test', 'obj1']]], [], [[0, ['test', 'arr', 0]]]],
      op2: [[], [[0, ['test', 'arr', 0, 'b']]]],
      expected: {
        test: {
          arr: [
            {
              a: 1,
            },
          ],
        },
      },
      // only: true,
    },
    {
      name: 'can move two values into an object',
      doc: {
        test: {
          a: {},
          b: 1,
          c: 2,
        },
      },
      op1: [[], [[0, ['test', 'b']]], [], [[0, ['test', 'a', 'x']]]],
      op2: [[], [[0, ['test', 'c']]], [], [[0, ['test', 'a', 'y']]]],
      expected: {
        test: {
          a: {
            x: 1,
            y: 2,
          },
        },
      },
      // only: true,
    },
    {
      name: 'can move value into another moved object',
      doc: {
        test: {
          a: {},
          b: {},
          c: 2,
        },
      },
      op1: [[], [[0, ['test', 'b']]], [], [[0, ['test', 'a', 'x']]]],
      op2: [[], [[0, ['test', 'c']]], [], [[0, ['test', 'a', 'x', 'y']]]],
      expected: {
        test: {
          a: {
            x: {
              y: 2,
            },
          },
        },
      },
      // only: true,
    },
    {
      name: 'renames keys in moved object',
      doc: {
        test: {
          a: {},
          b: {
            a: 1,
            b: 2,
          },
        },
      },
      op1: [[], [[0, ['test', 'b']]], [], [[0, ['test', 'a', 'b']]]],
      op2: [
        [],
        [
          [0, ['test', 'a', 'b', 'a']],
          [1, ['test', 'a', 'b', 'b']],
        ],
        [],
        [
          [0, ['test', 'a', 'b', 'x']],
          [1, ['test', 'a', 'b', 'y']],
        ],
      ],
      expected: {
        test: {
          a: {
            b: {
              x: 1,
              y: 2,
            },
          },
        },
      },
      // only: true,
    },
    {
      name: 'remove from array twice',
      doc: {
        test: {
          arr: [1, 2, 3, 4, 5],
        },
      },
      op1: [[], [[0, ['test', 'arr', 1]]], [], []],
      op2: [[], [[1, ['test', 'arr', 3]]], [], []],
      expected: {
        test: {
          arr: [1, 3, 4],
        },
      },
      // only: true,
    },
    {
      name: 'remove from array trice',
      doc: {
        test: {
          arr: [1, 2, 3, 4, 5],
        },
      },
      op1: [
        [],
        [
          [1, ['test', 'arr', 0]],
          // TODO: uncomment this to make the test fail.
          // [0, ['test', 'arr', 1]],
        ],
        [],
        [],
      ],
      op2: [[], [[0, ['test', 'arr', 0]]], [], []],
      expected: {
        test: {
          arr: [3, 4, 5],
        },
      },
      // only: true,
    },
  ],
};

describe(suite.name, () => {
  for (const testCase of suite.tests) {
    (testCase.only ? it.only : it)(testCase.name, () => {
      const tree1 = OpTree.from(clone(testCase.op1));
      const tree2 = OpTree.from(clone(testCase.op2));
      // console.log(tree1 + '');
      // console.log(tree2 + '');
      tree1.compose(tree2);
      // console.log(tree1 + '');
      const op3 = tree1.toJson();
      const clone2 = clone(testCase.doc);
      const res1 = apply(apply(clone(testCase.doc), testCase.op1), testCase.op2);
      const res2 = apply(clone2, op3);
      expect(res1).toStrictEqual(testCase.expected);
      expect(res1).toStrictEqual(res2);
    });
  }
});
