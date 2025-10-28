import type {ViewRange} from '../types';

export const view1: ViewRange = [
  '\nThis is a paragraph with emphasized text, strong text, and a link to example.com.',
  0,
  [
    [0, 0, 0, [['paragraph', 0, {}]]],
    [10, 26, 41, 'em'],
    [10, 43, 54, 'strong'],
    [
      6,
      70,
      81,
      'link',
      {
        href: 'https://example.com',
        title: null,
      },
    ],
  ],
];

export const view2: ViewRange = [
  '\nThis is a paragraph with nested inline styles and a link to example.com.',
  0,
  [
    [0, 0, 0, [['paragraph', 0, {}]]],
    [10, 26, 33, 'em'],
    [10, 33, 46, 'em'],
    [10, 33, 46, 'strong'],
    [
      6,
      61,
      72,
      'link',
      {
        href: 'https://example.com',
        title: null,
      },
    ],
    [10, 61, 72, 'strong'],
  ],
];

export const view3: ViewRange = [
  '\nThis is a paragraph with nested inline styles and a link to example.com.',
  0,
  [
    [0, 0, 0, [['paragraph', 0, {}]]],
    [10, 26, 33, 'em'],
    [10, 33, 46, 'em'],
    [10, 33, 46, 'strong'],
    [10, 61, 72, 'strong'],
    [
      6,
      61,
      72,
      'link',
      {
        href: 'https://example.com',
        title: null,
      },
    ],
  ],
];
