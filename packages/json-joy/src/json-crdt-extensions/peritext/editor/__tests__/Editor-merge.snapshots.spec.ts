import type {ViewRange} from '../types';
import {assertCanMergeIntoEmptyDocument, assertCanMergeViewTrain} from './merge';

test('fuzzer 1', () => {
  const view: ViewRange = [
    'abc\ndefghijklmn\nopqrstuvwxyz',
    0,
    [
      [0, 15, 15, 'K>e'],
      [0, 3, 3, 13],
      [5, 12, 15, -4],
    ],
  ];
  // logTree(view);
  assertCanMergeIntoEmptyDocument(view);
});

test('fuzzer 2', () => {
  const views: ViewRange[] = [
    [
      '012\n3\n45',
      0,
      [
        [
          0,
          3,
          3,
          '*dm|',
          {
            'SkZQ&p=': 1,
          },
        ],
        [
          0,
          5,
          5,
          [
            [-34, 0, {}],
            ['z*', 2, {}],
            [47, 0, {}],
          ],
        ],
        [10, 3, 4, '4'],
        [11, 2, 5, '7APyK'],
      ],
    ],
    [
      '01\n2345\n',
      0,
      [
        [0, 2, 2, ['vCKstZZ', 'T/5F*B}', ['E:T', 1]]],
        [0, 7, 7, 41],
        [5, 2, 4, 'Yyf*'],
        [4, 5, 7, "ZZY4V'"],
      ],
    ],
  ];
  assertCanMergeViewTrain(views);
});

test('fuzzer 3', () => {
  const views: ViewRange[] = [
    [
      'abcdefghi\njk\nlmnopqrs\ntuvwxyz\n',
      0,
      [
        [0, 9, 9, 26, {}],
        [0, 12, 12, 46],
        [0, 21, 21, ['tag'], {}],
        [0, 29, 29, [-45, 'ul', ':"v', ['l[']]],
        [4, 13, 16, 'code'],
        [10, 26, 26, 'abbr'],
      ],
    ],
    [
      'ab\nc\ndefghij\nklm\nno\npqrstuv\nwxy\nz',
      0,
      [
        [0, 2, 2, 'tag'],
        [0, 4, 4, [['q'], 'p'], {}],
        [0, 12, 12, -35],
        [0, 16, 16, [[50, 3, {a: 123}], [-26, 1], 24, [-29]]],
        [0, 19, 19, 35],
        [0, 27, 27, 'p'],
        [9, 27, 31, 38],
      ],
    ],
  ] as any;
  assertCanMergeViewTrain(views);
});

test('fuzzer 4', () => {
  const views: ViewRange[] = [
    [
      'abcdefghijklmnopqrstuvwxyz',
      0,
      [
        [10, 25, 25, 'EOkYd'],
        [6, 25, 25, 48, {}],
      ],
    ],
    [
      'abcdefghijklmnopq\nrstuvwxyz',
      0,
      [
        [0, 17, 17, [[-46, 0, {}], [-40], ['0i;/z)vL'], ['A;h必Tp', 2, {}]], {}],
        [9, 8, 11, -32, {}],
        [7, 18, 21, 'Iq'],
      ],
    ],
    [
      'ab\nc\nde\nfghij\nklm\nnopqrstuvwxyz',
      0,
      [
        [0, 2, 2, ['p]g', -42, [-56, 0, {}], ['U']]],
        [0, 4, 4, [['&Uxa,.', 3], [-58], [16], ['#FLbURE']]],
        [0, 7, 7, ['l1', 'W<vX']],
        [0, 13, 13, 1],
        [0, 17, 17, -16, {}],
        [6, 30, 30, -25],
      ],
    ],
  ] as any;
  assertCanMergeViewTrain(views);
});
