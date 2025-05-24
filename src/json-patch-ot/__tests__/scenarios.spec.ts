import type {Operation} from '../../json-patch/types';
import {applyOps} from '../../json-patch/applyPatch';
import {transform} from '../transform';
import {decode} from '../../json-patch/codec/json';

interface Scenario {
  only?: true;
  t?: true;
  name: string;
  docStart: unknown;
  user1: Operation[];
  user2: Operation[];
  docEnd: unknown;
}

interface ScenarioGroup {
  only?: true;
  name: string;
  scenarios: Scenario[];
}

const groups: ScenarioGroup[] = [
  {
    name: 'add x add',
    scenarios: [
      {
        name: 'Independent add operations should both succeed.',
        docStart: {},
        user1: [{op: 'add', path: '/foo', value: 1}],
        user2: [{op: 'add', path: '/bar', value: 2}],
        docEnd: {
          foo: 1,
          bar: 2,
        },
      },
      {
        name: 'When modifying the same target, second operation should win.',
        docStart: {},
        user1: [{op: 'add', path: '/foo', value: 1}],
        user2: [{op: 'add', path: '/foo', value: 2}],
        docEnd: {
          foo: 2,
        },
      },
      {
        name: "Second user's operation should be discarded if it tries to modify child property of the first operation.",
        docStart: {
          foo: {
            bar: 1,
          },
        },
        user1: [{op: 'add', path: '/foo', value: 'test'}],
        user2: [{op: 'add', path: '/foo/bar', value: 2}],
        docEnd: {
          foo: 'test',
        },
      },
      {
        name: 'When first op is child of second, should accept second.',
        docStart: {
          foo: {
            bar: 1,
          },
        },
        user1: [{op: 'add', path: '/foo/bar', value: 2}],
        user2: [{op: 'add', path: '/foo', value: 'test'}],
        docEnd: {
          foo: 'test',
        },
      },
      {
        name: 'When inserting into same place into array, both operations are kept and the first op appears first.',
        docStart: {
          list: [1, 2],
        },
        user1: [{op: 'add', path: '/list/1', value: 'a'}],
        user2: [{op: 'add', path: '/list/1', value: 'b'}],
        docEnd: {
          list: [1, 'a', 'b', 2],
        },
      },
      {
        name: 'When inserting at the beginning of array, first operation appears first.',
        docStart: {
          list: [1, 2],
        },
        user1: [{op: 'add', path: '/list/0', value: 'a'}],
        user2: [{op: 'add', path: '/list/0', value: 'b'}],
        docEnd: {
          list: ['a', 'b', 1, 2],
        },
      },
      {
        name: 'When inserting into higher position in array, index of the second operation in increased.',
        docStart: {
          list: [1, 2, 3],
        },
        user1: [{op: 'add', path: '/list/1', value: 'a'}],
        user2: [{op: 'add', path: '/list/2', value: 'b'}],
        docEnd: {
          list: [1, 'a', 2, 'b', 3],
        },
      },
      {
        name: 'When modifying deeply in higher array position, should bump index.',
        docStart: {
          list: [1, 2, {foo: 'bar'}],
        },
        user1: [{op: 'add', path: '/list/1', value: 'a'}],
        user2: [{op: 'add', path: '/list/2/foo', value: 'baz'}],
        docEnd: {
          list: [1, 'a', 2, {foo: 'baz'}],
        },
      },
      {
        name: 'When modifying deeply in lower array position, should not change index.',
        docStart: {
          list: [1, 2, {foo: 'bar'}, 3],
        },
        user1: [{op: 'add', path: '/list/3', value: 'a'}],
        user2: [{op: 'add', path: '/list/2/foo', value: 'baz'}],
        docEnd: {
          list: [1, 2, {foo: 'baz'}, 'a', 3],
        },
      },
      {
        name: 'When modifying deeply in same array position, should bump index.',
        docStart: {
          list: [1, 2, {foo: 'bar'}, 3],
        },
        user1: [{op: 'add', path: '/list/2', value: 'a'}],
        user2: [{op: 'add', path: '/list/2/foo', value: 'baz'}],
        docEnd: {
          list: [1, 2, 'a', {foo: 'baz'}, 3],
        },
      },
    ],
  },
  {
    name: 'add x remove',
    scenarios: [
      {
        name: 'Independent operations should both succeed.',
        docStart: {bar: 'test'},
        user1: [{op: 'add', path: '/foo', value: 1}],
        user2: [{op: 'remove', path: '/bar'}],
        docEnd: {
          foo: 1,
        },
      },
      {
        name: 'Removing same key succeeds.',
        docStart: {foo: 'test'},
        user1: [{op: 'add', path: '/foo', value: 1}],
        user2: [{op: 'remove', path: '/foo'}],
        docEnd: {},
      },
      {
        name: 'Removing same a sub-key fails.',
        docStart: {foo: {bar: 1}},
        user1: [{op: 'add', path: '/foo', value: {bar: 2}}],
        user2: [{op: 'remove', path: '/foo/bar'}],
        docEnd: {foo: {bar: 2}},
      },
      {
        name: 'Shifts array element deletion, when deleting same index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/1'}],
        docEnd: {foo: [1, 'test', 3]},
      },
      {
        name: 'Shifts array element deletion, when deleting same index sub-element.',
        docStart: {foo: [1, [2], 3]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/1/0'}],
        docEnd: {foo: [1, 'test', [], 3]},
      },
      {
        name: 'Shifts array element deletion, when deleting higher index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/2'}],
        docEnd: {foo: [1, 'test', 2]},
      },
      {
        name: 'Shifts array element deletion, when deleting higher index sub-element.',
        docStart: {foo: [1, 2, [1, 2, 3]]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/2/0'}],
        docEnd: {foo: [1, 'test', 2, [2, 3]]},
      },
      {
        name: 'Does not shift deletion index, when deleting lower index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/0'}],
        docEnd: {foo: ['test', 2, 3]},
      },
      {
        name: 'Does not shift deletion index, when deleting lower index sub-element.',
        docStart: {foo: [[1], 2, 3]},
        user1: [{op: 'add', path: '/foo/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/0/0'}],
        docEnd: {foo: [[], 'test', 2, 3]},
      },
      {
        name: 'Deletes array index when prev operation modified inside array.',
        docStart: {foo: [[1], [2], [3]]},
        user1: [{op: 'add', path: '/foo/1/1', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/1'}],
        docEnd: {foo: [[1], [3]]},
      },
      {
        name: 'Removes when "add" modifies child.',
        docStart: {foo: {bar: {}}},
        user1: [{op: 'add', path: '/foo/bar/baz', value: 'test'}],
        user2: [{op: 'remove', path: '/foo/bar'}],
        docEnd: {foo: {}},
      },
    ],
  },
  {
    name: 'add x replace',
    scenarios: [
      {
        name: 'Independent operations should both succeed.',
        docStart: {foo: [{b: 1}]},
        user1: [{op: 'add', path: '/foo/0/a', value: 1}],
        user2: [{op: 'replace', path: '/foo/0/b', value: 2}],
        docEnd: {
          foo: [
            {
              a: 1,
              b: 2,
            },
          ],
        },
      },
      {
        name: 'For same path operations replace wins.',
        docStart: {foo: [{b: 1}]},
        user1: [{op: 'add', path: '/foo/0/b', value: 2}],
        user2: [{op: 'replace', path: '/foo/0/b', value: 3}],
        docEnd: {
          foo: [
            {
              b: 3,
            },
          ],
        },
      },
      {
        name: 'Replace wins when it is parent operation.',
        docStart: {foo: [{b: 1}]},
        user1: [{op: 'add', path: '/foo/0/b', value: 2}],
        user2: [{op: 'replace', path: '/foo/0', value: 3}],
        docEnd: {foo: [3]},
      },
      {
        name: 'Replace succeeds, when add was parent in array.',
        docStart: {foo: [{b: 1}]},
        user1: [{op: 'add', path: '/foo/0', value: 2}],
        user2: [{op: 'replace', path: '/foo/0/b', value: 3}],
        docEnd: {foo: [2, {b: 3}]},
      },
      {
        name: 'Replace fails, when add was parent in object.',
        docStart: {a: {b: {c: 1}}},
        user1: [{op: 'add', path: '/a/b', value: 2}],
        user2: [{op: 'replace', path: '/a/b/c', value: 3}],
        docEnd: {a: {b: 2}},
      },
    ],
  },
  {
    name: 'add x move',
    scenarios: [
      {
        name: 'Independent operations should both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'add', path: '/c', value: 3}],
        user2: [{op: 'move', path: '/d', from: '/a'}],
        docEnd: {
          b: 2,
          c: 3,
          d: 1,
        },
      },
      {
        name: 'Moving into just created key should succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'add', path: '/c', value: 3}],
        user2: [{op: 'move', path: '/c', from: '/a'}],
        docEnd: {
          b: 2,
          c: 1,
        },
      },
      {
        // TODO: Knowing document value could help here. We could check if /c existed when move was scheduled.
        name: 'Moving field which was just modified should succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'add', path: '/c', value: 3}],
        user2: [{op: 'move', path: '/a', from: '/c'}],
        docEnd: {
          a: 3,
          b: 2,
        },
      },
      {
        name: 'Moving lower array element should succeed.',
        docStart: {a: [1, 2, 3]},
        user1: [{op: 'add', path: '/a/1', value: 'Y'}],
        user2: [{op: 'move', path: '/b', from: '/a/0'}],
        docEnd: {
          a: ['Y', 2, 3],
          b: 1,
        },
      },
      {
        name: 'When moving higher array element should adjust index.',
        docStart: {a: [1, 2, 3]},
        user1: [{op: 'add', path: '/a/1', value: 'Y'}],
        user2: [{op: 'move', path: '/b', from: '/a/2'}],
        docEnd: {
          a: [1, 'Y', 2],
          b: 3,
        },
      },
      {
        name: 'Should adjust index when moving array elements around insertion place.',
        docStart: {a: [1, 2, 3, 4, 5]},
        user1: [{op: 'add', path: '/a/2', value: '2'}],
        user2: [{op: 'move', path: '/a/3', from: '/a/0'}],
        docEnd: {a: [2, '2', 3, 4, 1, 5]},
      },
      {
        name: 'Should adjust index when moving array elements around insertion place (2).',
        docStart: {a: [1, 2, 3, 4, 5]},
        user1: [{op: 'add', path: '/a/2', value: '2'}],
        user2: [{op: 'move', path: '/a/0', from: '/a/3'}],
        docEnd: {a: [4, 1, 2, '2', 3, 5]},
      },
    ],
  },
  {
    name: 'add x copy',
    scenarios: [
      {
        name: 'Independent operations should both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'add', path: '/c', value: 3}],
        user2: [{op: 'copy', path: '/d', from: '/a'}],
        docEnd: {
          a: 1,
          b: 2,
          c: 3,
          d: 1,
        },
      },
      {
        name: 'When copy indices are lower.',
        docStart: [1, 2, 3],
        user1: [{op: 'add', path: '/2', value: '2'}],
        user2: [{op: 'copy', path: '/0', from: '/0'}],
        docEnd: [1, 1, 2, '2', 3],
      },
      {
        name: 'When copy indices are higher.',
        docStart: [1, 2, 3],
        user1: [{op: 'add', path: '/0', value: '0'}],
        user2: [{op: 'copy', path: '/3', from: '/1'}],
        docEnd: ['0', 1, 2, 3, 2],
      },
      {
        name: 'Overwrites same object key.',
        docStart: {a: {b: 1}},
        user1: [{op: 'add', path: '/a/c', value: 2}],
        user2: [{op: 'copy', path: '/a/c', from: '/a/b'}],
        docEnd: {a: {b: 1, c: 1}},
      },
    ],
  },
  {
    name: 'add x test',
    scenarios: [
      {
        name: 'Independent operations should both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'add', path: '/c', value: 3}],
        user2: [{op: 'test', path: '/b', value: 2}],
        docEnd: {
          a: 1,
          b: 2,
          c: 3,
        },
      },
      {
        name: 'Should adjust array index.',
        docStart: [1, 2, 3],
        user1: [{op: 'add', path: '/0', value: 0}],
        user2: [{op: 'test', path: '/2', value: 3}],
        docEnd: [0, 1, 2, 3],
      },
    ],
  },
  {
    name: 'remove x add',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'add', path: '/b', value: 2}],
        docEnd: {b: 2},
      },
      {
        name: 'Can overwrite same key.',
        docStart: {a: 1},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'add', path: '/a', value: 2}],
        docEnd: {a: 2},
      },
      /*
      {
        name: 'Discards child operation.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'add', path: '/a/b', value: 2}],
        docEnd: {},
      },
      */
      {
        name: 'Succeeds when "add" array index is lower.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/2'}],
        user2: [{op: 'add', path: '/0', value: '1'}],
        docEnd: ['1', 1, 2],
      },
      {
        name: 'Adjusts array index when "add" index is higher.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/0'}],
        user2: [{op: 'add', path: '/2', value: '2'}],
        docEnd: [2, '2', 3],
      },
      {
        name: 'Adjusts array index when "add" index is the same.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/1'}],
        user2: [{op: 'add', path: '/1', value: '1'}],
        docEnd: [1, '1', 3],
      },
    ],
  },
  {
    name: 'remove x remove',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'remove', path: '/b'}],
        docEnd: {},
      },
      /*
      {
        name: 'Rejects if child path.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'remove', path: '/a/b'}],
        docEnd: {},
      },
      */
      {
        name: 'Succeeds if parent path.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a/b'}],
        user2: [{op: 'remove', path: '/a'}],
        docEnd: {},
      },
      {
        name: 'Does not shift array index if second operation is lower.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/2'}],
        user2: [{op: 'remove', path: '/0'}],
        docEnd: [2],
      },
      {
        name: 'Shifts array index if second operation is higher.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/0'}],
        user2: [{op: 'remove', path: '/2'}],
        docEnd: [2],
      },
      {
        name: 'Removes second operation if it deletes same array index.',
        docStart: [1, 2, 3],
        user1: [{op: 'remove', path: '/1'}],
        user2: [{op: 'remove', path: '/1'}],
        docEnd: [1, 3],
      },
      {
        name: 'Keeps second operation if it deletes same object field.',
        docStart: {a: 1},
        user1: [{op: 'remove', path: '/a'}],
        user2: [
          {op: 'add', path: '/a', value: 2},
          {op: 'remove', path: '/a'},
        ],
        docEnd: {},
      },
    ],
  },
  {
    name: 'remove x replace',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'replace', path: '/b', value: 3}],
        docEnd: {b: 3},
      },
      {
        name: 'Operation for same object is not removed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        // TODO: Need to look at all operations in-between to decide whether to remove the "replace" op.
        user2: [
          {op: 'add', path: '/a', value: 0},
          {op: 'replace', path: '/a', value: 3},
        ],
        docEnd: {a: 3, b: 2},
      },
      {
        name: 'Object child operation of "remove" is kept.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a'}],
        // TODO: Need to look at all operations in-between to decide whether to remove the "replace" op.
        user2: [
          {op: 'add', path: '/a', value: {b: 0}},
          {op: 'replace', path: '/a/b', value: 2},
        ],
        docEnd: {a: {b: 2}},
      },
      {
        name: 'If "remove" is object child operation, both operations succeed.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a/b'}],
        user2: [{op: 'replace', path: '/a', value: 2}],
        docEnd: {a: 2},
      },
      {
        name: 'Can replace lower array element.',
        docStart: {a: [1, 2, 3]},
        user1: [{op: 'remove', path: '/a/1'}],
        user2: [{op: 'replace', path: '/a/0', value: 4}],
        docEnd: {a: [4, 3]},
      },
      {
        name: 'Can replace higher array element.',
        docStart: {a: [1, 2, 3]},
        user1: [{op: 'remove', path: '/a/1'}],
        user2: [{op: 'replace', path: '/a/2', value: 4}],
        docEnd: {a: [1, 4]},
      },
      {
        name: 'Can replace same array element.',
        docStart: {a: [1, 2, 3]},
        user1: [{op: 'remove', path: '/a/1'}],
        user2: [{op: 'replace', path: '/a/1', value: 4}],
        docEnd: {a: [1, 4]},
      },
    ],
  },
  {
    name: 'remove x move',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'move', path: '/c', from: '/b'}],
        docEnd: {c: 2},
      },
      {
        name: 'Moving into removed object key.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'move', path: '/a', from: '/b'}],
        docEnd: {a: 2},
      },
      {
        /**
         * Imagine two scenarios, x are committed unknown ops on the server and y
         * are new ops coming from the client.
         *
         * Scenario 1:
         *
         * x1: {op: 'remove', path: '/a'}
         * ---------------------------------------------------------------------
         * y1: {op: 'add', path: '/a', value: 1}
         * y2: {op: 'move', path: '/b', from: '/a'} <-- We must keep y2 as it depends on y1.
         *
         *
         * Scenario 2:
         *
         * x1: {op: 'remove', path: '/a'}
         * ---------------------------------------------------------------------
         * y1: {op: 'move', path: '/b', from: '/a'} <-- We could remove y1 as we know for sure that
         *                                              "/a" does not exist. But is it worth the
         *                                              effort? y1 would just fail in this case and
         *                                              everyone is still happy.
         *
         */
        name: 'Moving removed object key should be kept in case it earlier ops depend on it.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [
          {op: 'add', path: '/a', value: 3},
          {op: 'move', path: '/c', from: '/a'},
        ],
        docEnd: {b: 2, c: 3},
      },
      {
        name: 'Moving from lower array index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/x', from: '/foo/0'}],
        docEnd: {foo: [3], x: 1},
      },
      {
        name: 'Moving from higher array index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/x', from: '/foo/2'}],
        docEnd: {foo: [1], x: 3},
      },
      {
        name: 'Moving from same array index.',
        docStart: {foo: [1, 2, 3]},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/x', from: '/foo/1'}],
        docEnd: {foo: [1], x: 3},
      },
      {
        name: 'Moving into lower array index.',
        docStart: {foo: [1, 2, 3], x: 4},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/foo/0', from: '/x'}],
        docEnd: {foo: [4, 1, 3]},
      },
      {
        name: 'Moving into higher array index.',
        docStart: {foo: [1, 2, 3], x: 4},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/foo/2', from: '/x'}],
        docEnd: {foo: [1, 4, 3]},
      },
      {
        name: 'Moving into higher array index (2).',
        docStart: {foo: [1, 2, 3], x: 4},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/foo/3', from: '/x'}],
        docEnd: {foo: [1, 3, 4]},
      },
      {
        name: 'Moving into the same array index.',
        docStart: {foo: [1, 2, 3], x: 4},
        user1: [{op: 'remove', path: '/foo/1'}],
        user2: [{op: 'move', path: '/foo/1', from: '/x'}],
        docEnd: {foo: [1, 4, 3]},
      },
    ],
  },
  {
    name: 'remove x copy',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'remove', path: '/a'}],
        user2: [{op: 'copy', path: '/c', from: '/b'}],
        docEnd: {b: 2, c: 2},
      },
      {
        name: 'Copying child element should succeed.',
        docStart: {a: {b: 1}},
        user1: [{op: 'remove', path: '/a'}],
        user2: [
          {op: 'add', path: '/a', value: {b: 2}},
          {op: 'copy', path: '/c', from: '/a/b'},
        ],
        docEnd: {a: {b: 2}, c: 2},
      },
    ],
  },
  {
    name: 'replace x add',
    scenarios: [],
  },
  {
    name: 'move x add',
    scenarios: [
      {
        name: 'Independent operations both succeed.',
        docStart: {a: 1, b: 2},
        user1: [{op: 'move', path: '/c', from: '/a'}],
        user2: [{op: 'add', path: '/d', value: 3}],
        docEnd: {b: 2, c: 1, d: 3},
      },
      {
        name: 'Rewriting moved object key.',
        docStart: {a: 1},
        user1: [{op: 'move', path: '/b', from: '/a'}],
        user2: [{op: 'add', path: '/a', value: 2}],
        docEnd: {a: 2, b: 1},
      },
      {
        name: 'Adding to child of moved object key is done in the new location.',
        docStart: {a: {b: 1}},
        user1: [{op: 'move', path: '/b', from: '/a'}],
        user2: [{op: 'add', path: '/a/b', value: 2}],
        docEnd: {b: {b: 2}},
      },
    ],
  },
  {
    name: 'move x replace',
    scenarios: [
      {
        name: 'Replacing child of moved object key is done in the new location.',
        docStart: {
          slides: {
            foo: {
              title: 'Hello world',
            },
          },
        },
        user1: [{op: 'move', from: '/slides/foo', path: '/slides/bar'}],
        user2: [{op: 'replace', path: '/slides/foo/title', value: 'News round-table'}],
        docEnd: {
          slides: {
            bar: {
              title: 'News round-table',
            },
          },
        },
      },
    ],
  },
  {
    name: 'str_ins x str_ins',
    scenarios: [
      {
        name: 'Inserts into same string at higher position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_ins', path: '/a', pos: 3, str: '_bar_'}],
        docEnd: {a: '12_foo_3_bar_45'},
      },
      {
        name: 'Inserts into same string at higher position (2).',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [
          {op: 'str_ins', path: '/a', pos: 3, str: '_bar_'},
          {op: 'str_ins', path: '/a', pos: 3 + 5, str: '_baz_'},
        ],
        docEnd: {a: '12_foo_3_bar__baz_45'},
      },
      {
        name: 'Inserts into same string at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_ins', path: '/a', pos: 0, str: '_bar_'}],
        docEnd: {a: '_bar_12_foo_345'},
      },
      {
        name: 'Inserts into same string at the same position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_ins', path: '/a', pos: 2, str: '_bar_'}],
        docEnd: {a: '12_foo__bar_345'},
      },
    ],
  },
  {
    name: 'str_ins x str_del',
    scenarios: [
      {
        name: 'Deletes at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 0, str: '12'}],
        docEnd: {a: '_foo_345'},
      },
      {
        name: 'Deletes at lower position overlapping the first insert.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 0, str: '1234'}],
        docEnd: {a: '_foo_5'},
      },
      {
        name: 'Deletes after the inserted string.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 3, str: '45'}],
        docEnd: {a: '12_foo_3'},
      },
    ],
  },
  {
    name: 'str_del x str_ins',
    scenarios: [
      {
        name: 'Inserts at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 3, str: '4'}],
        user2: [{op: 'str_ins', path: '/a', pos: 1, str: 'X'}],
        docEnd: {a: '1X235'},
      },
      {
        name: 'Inserts at higher position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, str: '23'}],
        user2: [{op: 'str_ins', path: '/a', pos: 4, str: 'X'}],
        docEnd: {a: '14X5'},
      },
      {
        name: 'Inserts at same position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, str: '23'}],
        user2: [{op: 'str_ins', path: '/a', pos: 1, str: 'X'}],
        docEnd: {a: '1X45'},
      },
    ],
  },
  {
    name: 'str_del x str_del',
    scenarios: [
      {
        name: 'Deletes at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 3, str: '4'}],
        user2: [{op: 'str_del', path: '/a', pos: 1, str: '2'}],
        docEnd: {a: '135'},
      },
      {
        name: 'Deletes at lower position partially overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 3, str: '45'}],
        user2: [{op: 'str_del', path: '/a', pos: 1, str: '234'}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at lower position completely overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, str: '34'}],
        user2: [{op: 'str_del', path: '/a', pos: 1, str: '2345'}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at same position.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, str: '34'}],
        user2: [{op: 'str_del', path: '/a', pos: 2, str: '345'}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position partially overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, str: '34'}],
        user2: [{op: 'str_del', path: '/a', pos: 3, str: '45'}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position exactly overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, str: '345'}],
        user2: [{op: 'str_del', path: '/a', pos: 3, str: '45'}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position completely overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 1, str: '2345'}],
        user2: [{op: 'str_del', path: '/a', pos: 2, str: '34'}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at higher position not overlapping.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, str: '2'}],
        user2: [{op: 'str_del', path: '/a', pos: 3, str: '4'}],
        docEnd: {a: '135'},
      },
    ],
  },
  {
    name: 'str_ins x str_del (with str_del.len)',
    scenarios: [
      {
        name: 'Deletes at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 0, len: '12'.length}],
        docEnd: {a: '_foo_345'},
      },
      {
        name: 'Deletes at lower position overlapping the first insert.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 0, len: '1234'.length}],
        docEnd: {a: '_foo_5'},
      },
      {
        name: 'Deletes after the inserted string.',
        docStart: {a: '12345'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: '_foo_'}],
        user2: [{op: 'str_del', path: '/a', pos: 3, len: '45'.length}],
        docEnd: {a: '12_foo_3'},
      },
    ],
  },
  {
    name: 'str_del x str_ins (with str_del.len)',
    scenarios: [
      {
        name: 'Inserts at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 3, len: '4'.length}],
        user2: [{op: 'str_ins', path: '/a', pos: 1, str: 'X'}],
        docEnd: {a: '1X235'},
      },
      {
        name: 'Inserts at higher position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, len: '23'.length}],
        user2: [{op: 'str_ins', path: '/a', pos: 4, str: 'X'}],
        docEnd: {a: '14X5'},
      },
      {
        name: 'Inserts at same position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, len: '23'.length}],
        user2: [{op: 'str_ins', path: '/a', pos: 1, str: 'X'}],
        docEnd: {a: '1X45'},
      },
    ],
  },
  {
    name: 'str_del x str_del (with str_del.len)',
    scenarios: [
      {
        name: 'Deletes at lower position.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 3, len: '4'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 1, len: '2'.length}],
        docEnd: {a: '135'},
      },
      {
        name: 'Deletes at lower position partially overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 3, len: '45'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 1, len: '234'.length}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at lower position completely overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, len: '34'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 1, len: '2345'.length}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at same position.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, len: '34'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 2, len: '345'.length}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position partially overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, len: '34'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 3, len: '45'.length}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position exactly overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 2, len: '345'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 3, len: '45'.length}],
        docEnd: {a: '126'},
      },
      {
        name: 'Deletes at higher position completely overlapping.',
        docStart: {a: '123456'},
        user1: [{op: 'str_del', path: '/a', pos: 1, len: '2345'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 2, len: '34'.length}],
        docEnd: {a: '16'},
      },
      {
        name: 'Deletes at higher position not overlapping.',
        docStart: {a: '12345'},
        user1: [{op: 'str_del', path: '/a', pos: 1, len: '2'.length}],
        user2: [{op: 'str_del', path: '/a', pos: 3, len: '4'.length}],
        docEnd: {a: '135'},
      },
    ],
  },
  {
    name: 'str_ins x str_del (same position)',
    scenarios: [
      {
        name: 'Deletes at same position as insert.',
        docStart: {a: 'abcde'},
        user1: [{op: 'str_ins', path: '/a', pos: 0, str: 'X'}],
        user2: [{op: 'str_del', path: '/a', pos: 0, str: 'abc'}],
        docEnd: {a: 'Xde'},
      },
      {
        name: 'Deletes at same non-zero position as insert.',
        docStart: {a: '12abcde'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: 'X'}],
        user2: [{op: 'str_del', path: '/a', pos: 2, str: 'abc'}],
        docEnd: {a: '12Xde'},
      },
      {
        name: 'Deletes at higher position than insert.',
        docStart: {a: 'hello world'},
        user1: [{op: 'str_ins', path: '/a', pos: 2, str: 'XX'}],
        user2: [{op: 'str_del', path: '/a', pos: 8, str: 'rld'}],
        docEnd: {a: 'heXXllo wo'},
      },
    ],
  },
  /*
  {
    name: 'move x replace',
    scenarios: [
      {
        name: 'Should replace array element which was moved.',
        docStart: {
          list: [1, 2, 3, 4, 5],
        },
        user1: [{op: 'move', from: '/list/1', path: '/list/2'}],
        user2: [{op: 'replace', path: '/list/1', value: 99}],
        docEnd: {
          list: [1, 3, 99, 4, 5],
        },
      },
    ],
  },
  */
];

for (const group of groups) {
  (group.only ? describe.only : describe)(group.name, () => {
    for (const {only, name, docStart, docEnd, user1, user2, t} of group.scenarios) {
      (only ? test.only : test)(name, () => {
        const ops1 = decode(user1, {});
        const ops2 = decode(user2, {});
        const doc1 = applyOps(docStart, ops1, false).doc;
        const transformed = transform(ops1, ops2);
        // tslint:disable-next-line
        if (t) console.log(transformed);
        const doc2 = applyOps(doc1, transformed, false).doc;
        expect(doc2).toEqual(docEnd);
      });
    }
  });
}

