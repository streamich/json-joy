module.exports = [
  {op: 'add', path: '/foo/baz', value: 666},
  {op: 'add', path: '/foo/bx', value: 666},
  {op: 'add', path: '/asdf', value: 'asdfadf asdf'},
  {op: 'move', path: '/arr/0', from: '/arr/1'},
  {op: 'replace', path: '/foo/baz', value: 'lorem ipsum'},
  {
    op: 'add',
    path: '/docs/latest',
    value: {
      name: 'blog post',
      json: {
        id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        author: {
          name: 'John 💪',
          handle: '@johny',
        },
        lastSeen: -12345,
        tags: [null, 'Sports 🏀', 'Personal', 'Travel'],
        pins: [
          {
            id: 1239494,
          },
        ],
        marks: [
          {
            x: 1,
            y: 1.234545,
            w: 0.23494,
            h: 0,
          },
        ],
        hasRetweets: false,
        approved: true,
        mediumString: 'The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer.',
        longString:
          'Level-up on the skills most in-demand at QCon London Software Development Conference on April. Level-up on the skills most in-demand at QCon London Software Development Conference on April. Level-up on the skills most in-demand at QCon London Software Development Conference on April.',
        '👍': 33,
      },
    },
  },
];
