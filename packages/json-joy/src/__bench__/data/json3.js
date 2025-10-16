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
        friend: {
          firstName: 'John',
          lastName: 'Smith',
          isAlive: true,
          age: 27,
          address: {
            streetAddress: '21 2nd Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10021-3100',
          },
          phoneNumbers: [
            {
              type: 'home',
              number: '212 555-1234',
            },
            {
              type: 'office',
              number: '646 555-4567',
            },
          ],
          children: [],
          spouse: null,
        },
        hasRetweets: false,
        approved: true,
        '👍': 33,
        paragraphs: [
          {
            children: [
              {
                text: 'LZ4 is a very fast compression and decompression algorithm. This nodejs module provides a Javascript implementation of the decoder as well as native bindings to the LZ4 functions. Nodejs Streams are also supported for compression and decompression.',
              },
            ],
          },
          {
            children: [
              {
                text: 'The stream can then decode any data piped to it. It will emit a data event on each decoded sequence, which can be saved into an output stream.',
              },
            ],
          },
          {
            children: [
              {
                text: 'In some cases, it is useful to be able to manipulate an LZ4 block instead of an LZ4 stream. The functions to decode and encode are therefore exposed as:',
              },
            ],
          },
          {
            children: [
              {
                text: 'Second, compressing small strings as standalone, decompressible files, which it seems you are implying, will result in rather poor compression in most cases. You should be concatenating those strings, along with whatever structure you need to be able to pull them apart again, at least to about the 1 MB level and applying compression to those. You did not say how you want to later access these strings, which would need to be taken into account in such a scheme.',
              },
            ],
          },
          {
            children: [
              {
                text: 'Training works if there is some correlation in a family of small data samples. The more data-specific a dictionary is, the more efficient it is (there is no universal dictionary). Hence, deploying one dictionary per type of data will provide the greatest benefits. Dictionary gains are mostly effective in the first few KB. Then, the compression algorithm will gradually use previously decoded content to better compress the rest of the file.',
              },
            ],
          },
        ],
        media: [
          {
            id: 968129121061490700,
            id_str: '968129121061490690',
            indices: [82, 105],
            media_url: 'http://pbs.twimg.com/media/DW98TmWU0AItmlv.jpg',
            media_url_https: 'https://pbs.twimg.com/media/DW98TmWU0AItmlv.jpg',
            url: 'https://t.co/hg7I3xAlBg',
            display_url: 'pic.twitter.com/hg7I3xAlBg',
            expanded_url: 'https://twitter.com/honeydrop_506/status/968130023566684160/photo/1',
            type: 'photo',
            sizes: {
              thumb: {
                w: 150,
                h: 150,
                resize: 'crop',
              },
              medium: {
                w: 800,
                h: 1200,
                resize: 'fit',
              },
              small: {
                w: 453,
                h: 680,
                resize: 'fit',
              },
              large: {
                w: 1000,
                h: 1500,
                resize: 'fit',
              },
            },
          },
        ],
        data: [
          {
            id: 'X999_Y999',
            from: {
              name: 'Tom Brady',
              id: 'X12',
            },
            message: 'Looking forward to 2010!',
            actions: [
              {
                name: 'Comment',
                link: 'http://www.facebook.com/X999/posts/Y999',
              },
              {
                name: 'Like',
                link: 'http://www.facebook.com/X999/posts/Y999',
              },
            ],
            type: 'status',
            created_time: '2010-08-02T21:27:44+0000',
            updated_time: '2010-08-02T21:27:44+0000',
          },
          {
            id: 'X998_Y998',
            from: {
              name: 'Peyton Manning',
              id: 'X18',
            },
            message: "Where's my contract?",
            actions: [
              {
                name: 'Comment',
                link: 'http://www.facebook.com/X998/posts/Y998',
              },
              {
                name: 'Like',
                link: 'http://www.facebook.com/X998/posts/Y998',
              },
            ],
            type: 'status',
            created_time: '2010-08-02T21:27:44+0000',
            updated_time: '2010-08-02T21:27:44+0000',
          },
        ],
      },
    },
  },
];
