export interface JsonDocument {
  name: string;
  json: unknown;
  only?: true;
}

/**
 * A list of various JSON documents used for testing.
 */
export const documents: JsonDocument[] = [
  {
    name: 'null',
    json: null,
  },
  {
    name: 'true',
    json: true,
  },
  {
    name: 'false',
    json: false,
  },
  {
    name: 'zero',
    json: 0,
  },
  {
    name: 'one',
    json: 1,
  },
  {
    name: 'uint7',
    json: 123,
  },
  {
    name: 'uint8',
    json: 222,
  },
  {
    name: 'two byte int',
    json: 1024,
  },
  {
    name: 'four byte word',
    json: 0xfafafafa,
  },
  {
    name: 'eight byte word',
    json: 0x74747474239,
  },
  {
    name: 'small negative integer (-1)',
    json: -1,
  },
  {
    name: 'small negative integer (-2)',
    json: -2,
  },
  {
    name: 'small negative integer (-3)',
    json: -3,
  },
  {
    name: 'small negative integer (-4)',
    json: -4,
  },
  {
    name: 'small negative integer (-15)',
    json: -15,
  },
  {
    name: 'small negative integer (-16)',
    json: -16,
  },
  {
    name: 'small negative char',
    json: -100,
  },
  {
    name: 'small negative char - 2',
    json: -55,
  },
  {
    name: 'small negative char at boundary',
    json: -127,
  },
  {
    name: 'small negative char at boundary - 2',
    json: -128,
  },
  {
    name: 'negative two byte word',
    json: -0x0fcd,
  },
  {
    name: 'negative three byte word',
    json: -0x0fcdaa,
  },
  {
    name: 'negative four byte word',
    json: -0x0fcdaaff,
  },
  {
    name: 'negative five byte word',
    json: -0x0fcdaaffac,
  },
  {
    name: 'negative six byte word',
    json: -0xaabbccddeefa,
  },
  {
    name: 'half',
    json: 0.5,
  },
  {
    name: 'float32',
    json: 1.5,
  },
  {
    name: 'float64',
    json: 1.1,
  },
  {
    name: 'empty string',
    json: '',
  },
  {
    name: 'supports umlauts',
    json: 'äbc',
  },
  {
    name: 'supports emojis',
    json: '👨‍👩‍👦‍👦',
  },
  {
    name: 'empty string in array',
    json: [''],
  },
  {
    name: 'empty string in object',
    json: {foo: ''},
  },
  {
    name: 'simple string',
    json: 'hello world',
  },
  {
    name: 'empty array',
    json: [],
  },
  {
    name: 'array in array',
    json: [[]],
  },
  {
    name: 'array in array twice',
    json: [[[]]],
  },
  {
    name: 'numbers in arrays',
    json: [1, 0.4, [-3, [7, 9, 0, -1]], 2, 3, 0.6],
  },
  {
    name: 'array of falsy values',
    json: [0, null, false, ''],
  },
  {
    name: 'array of strings',
    json: [
      '227 mi',
      '3 hours 54 mins',
      '94.6 mi',
      '1 hour 44 mins',
      '2,878 mi',
      '1 day 18 hours',
      '1,286 mi',
      '18 hours 43 mins',
      '1,742 mi',
      '1 day 2 hours',
      '2,871 mi',
      '1 day 18 hours',
    ],
  },
  {
    name: 'empty object',
    json: {},
  },
  {
    name: 'empty key and empty string value object',
    json: {'': ''},
  },
  {
    name: 'simple object',
    json: {
      foo: 'bar',
      baz: ['qux'],
    },
  },
  {
    name: 'simple document',
    json: {
      name: 'Senior Pomidor',
      age: 12,
      keywords: ['tomato man'],
    },
  },
  {
    name: 'umlaut in object key',
    json: {
      ö: 1,
    },
  },
  {
    name: 'data in object after key with umlaut',
    json: {
      a: 'ö',
      b: 1,
    },
  },
  {
    name: 'blog post',
    json: {
      id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      author: {
        name: 'John',
        handle: '@johny',
      },
      lastSeen: -12345,
      tags: [null, 'Sports', 'Personal', 'Travel'],
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
      likes: 33,
    },
  },
  {
    name: 'user object',
    json: {
      title: 'Person',
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        age: {
          description: 'Age in years',
          type: 'integer',
          minimum: 0,
        },
      },
      required: ['firstName', 'lastName'],
    },
  },
  {
    name: 'completion response',
    json: {
      done: false,
      text: 'do something',
    },
  },
  {
    name: 'cooking receipt',
    json: {
      id: '0001',
      type: 'donut',
      name: 'Cake',
      ppu: 0.55,
      batters: {
        batter: [
          {id: '1001', type: 'Regular'},
          {id: '1002', type: 'Chocolate'},
          {id: '1003', type: 'Blueberry'},
          {id: '1004', type: "Devil's Food"},
        ],
      },
      topping: [
        {id: '5001', type: 'None'},
        {id: '5002', type: 'Glazed'},
        {id: '5005', type: 'Sugar'},
        {id: '5007', type: 'Powdered Sugar'},
        {id: '5006', type: 'Chocolate with Sprinkles'},
        {id: '5003', type: 'Chocolate'},
        {id: '5004', type: 'Maple'},
      ],
    },
  },
  {
    name: 'JSON-LD object',
    json: {
      '@context': {
        '@version': 1.1,
        schema: 'http://schema.org/',
        name: 'schema:name',
        body: 'schema:articleBody',
        words: 'schema:wordCount',
        post: {
          '@id': 'schema:blogPost',
          '@container': '@id',
        },
        none: '@none',
      },
      '@id': 'http://example.com/',
      '@type': 'schema:Blog',
      name: 'World Financial News',
      post: {
        'http://example.com/posts/1/en': {
          body: 'World commodities were up today with heavy trading of crude oil...',
          words: 1539,
        },
        'http://example.com/posts/1/de': {
          body: 'Die Werte an Warenbörsen stiegen im Sog eines starken Handels von Rohöl...',
          words: 1204,
        },
        none: {
          body: 'Description for object within an @id',
          words: 20,
        },
      },
    },
  },
  {
    name: 'JSON-LD object - 2',
    json: {
      '@context': {
        '@version': 1.1,
        generatedAt: {
          '@id': 'http://www.w3.org/ns/prov#generatedAtTime',
          '@type': 'http://www.w3.org/2001/XMLSchema#date',
        },
        Person: 'http://xmlns.com/foaf/0.1/Person',
        name: 'http://xmlns.com/foaf/0.1/name',
        knows: 'http://xmlns.com/foaf/0.1/knows',
        graphMap: {
          '@id': 'http://example.org/graphMap',
          '@container': ['@graph', '@id'],
        },
      },
      '@id': '_:graph',
      generatedAt: '2012-04-09',
      graphMap: {
        '_:manu': {
          '@id': 'http://manu.sporny.org/about#manu',
          '@type': 'Person',
          name: 'Manu Sporny',
          knows: 'http://greggkellogg.net/foaf#me',
        },
        '_:gregg': {
          '@id': 'http://greggkellogg.net/foaf#me',
          '@type': 'Person',
          name: 'Gregg Kellogg',
          knows: 'http://manu.sporny.org/about#manu',
        },
      },
    },
  },
  {
    name: 'three objects nested with a key "c" as time = 4 (undefined)',
    json: {
      a: {
        a: 1,
        b: {
          c: 2,
        },
      },
    },
  },
  {
    name: 'various types',
    json: {
      int0: 0,
      int1: 1,
      'int1-': -1,
      int8: 255,
      'int8-': -255,
      int16: 256,
      'int16-': -256,
      int32: 65536,
      'int32-': -65536,
      nil: null,
      true: true,
      false: false,
      float: 0.5,
      'float-': -0.5,
      string0: '',
      string1: 'A',
      string4: 'foobarbaz',
      string8: 'Omnes viae Romam ducunt.',
      string16:
        'L’homme n’est qu’un roseau, le plus faible de la nature ; mais c’est un roseau pensant. Il ne faut pas que l’univers entier s’arme pour l’écraser : une vapeur, une goutte d’eau, suffit pour le tuer. Mais, quand l’univers l’écraserait, l’homme serait encore plus noble que ce qui le tue, puisqu’il sait qu’il meurt, et l’avantage que l’univers a sur lui, l’univers n’en sait rien. Toute notre dignité consiste donc en la pensée. C’est de là qu’il faut nous relever et non de l’espace et de la durée, que nous ne saurions remplir. Travaillons donc à bien penser : voilà le principe de la morale.',
      array0: [],
      array1: ['foo'],
      array8: [
        1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288,
        1048576,
      ],
      map0: {},
      map1: {
        foo: 'bar',
      },
    },
  },
  {
    name: 'JSON-RPC request',
    json: {
      version: '1.1',
      method: 'confirmFruitPurchase',
      params: [['apple', 'orange', 'mangoes'], 1.123],
      id: '194521489',
    },
  },
  {
    name: 'object with a long key',
    json: {
      a: 'a',
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890':
        'that key was long indeed',
      b: 'b',
    },
  },
  {
    name: 'JSON Patch example',
    json: [
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
    ],
  },
  {
    name: 'medical document',
    json: {
      medications: [
        {
          aceInhibitors: [
            {
              name: 'lisinopril',
              strength: '10 mg Tab',
              dose: '1 tab',
              route: 'PO',
              sig: 'daily',
              pillCount: '#90',
              refills: 'Refill 3',
            },
          ],
          antianginal: [
            {
              name: 'nitroglycerin',
              strength: '0.4 mg Sublingual Tab',
              dose: '1 tab',
              route: 'SL',
              sig: 'q15min PRN',
              pillCount: '#30',
              refills: 'Refill 1',
            },
          ],
          anticoagulants: [
            {
              name: 'warfarin sodium',
              strength: '3 mg Tab',
              dose: '1 tab',
              route: 'PO',
              sig: 'daily',
              pillCount: '#90',
              refills: 'Refill 3',
            },
          ],
          betaBlocker: [
            {
              name: 'metoprolol tartrate',
              strength: '25 mg Tab',
              dose: '1 tab',
              route: 'PO',
              sig: 'daily',
              pillCount: '#90',
              refills: 'Refill 3',
            },
          ],
          diuretic: [
            {
              name: 'furosemide',
              strength: '40 mg Tab',
              dose: '1 tab',
              route: 'PO',
              sig: 'daily',
              pillCount: '#90',
              refills: 'Refill 3',
            },
          ],
          mineral: [
            {
              name: 'potassium chloride ER',
              strength: '10 mEq Tab',
              dose: '1 tab',
              route: 'PO',
              sig: 'daily',
              pillCount: '#90',
              refills: 'Refill 3',
            },
          ],
        },
      ],
      labs: [
        {
          name: 'Arterial Blood Gas',
          time: 'Today',
          location: 'Main Hospital Lab',
        },
        {
          name: 'BMP',
          time: 'Today',
          location: 'Primary Care Clinic',
        },
        {
          name: 'BNP',
          time: '3 Weeks',
          location: 'Primary Care Clinic',
        },
        {
          name: 'BUN',
          time: '1 Year',
          location: 'Primary Care Clinic',
        },
        {
          name: 'Cardiac Enzymes',
          time: 'Today',
          location: 'Primary Care Clinic',
        },
        {
          name: 'CBC',
          time: '1 Year',
          location: 'Primary Care Clinic',
        },
        {
          name: 'Creatinine',
          time: '1 Year',
          location: 'Main Hospital Lab',
        },
        {
          name: 'Electrolyte Panel',
          time: '1 Year',
          location: 'Primary Care Clinic',
        },
        {
          name: 'Glucose',
          time: '1 Year',
          location: 'Main Hospital Lab',
        },
        {
          name: 'PT/INR',
          time: '3 Weeks',
          location: 'Primary Care Clinic',
        },
        {
          name: 'PTT',
          time: '3 Weeks',
          location: 'Coumadin Clinic',
        },
        {
          name: 'TSH',
          time: '1 Year',
          location: 'Primary Care Clinic',
        },
      ],
      imaging: [
        {
          name: 'Chest X-Ray',
          time: 'Today',
          location: 'Main Hospital Radiology',
        },
        {
          name: 'Chest X-Ray',
          time: 'Today',
          location: 'Main Hospital Radiology',
        },
        {
          name: 'Chest X-Ray',
          time: 'Today',
          location: 'Main Hospital Radiology',
        },
      ],
    },
  },
  {
    name: 'google maps distance',
    json: {
      destination_addresses: [
        'Washington, DC, USA',
        'Philadelphia, PA, USA',
        'Santa Barbara, CA, USA',
        'Miami, FL, USA',
        'Austin, TX, USA',
        'Napa County, CA, USA',
      ],
      origin_addresses: ['New York, NY, USA'],
      rows: [
        {
          elements: [
            {
              distance: {
                text: '227 mi',
                value: 365468,
              },
              duration: {
                text: '3 hours 54 mins',
                value: 14064,
              },
              status: 'OK',
            },
            {
              distance: {
                text: '94.6 mi',
                value: 152193,
              },
              duration: {
                text: '1 hour 44 mins',
                value: 6227,
              },
              status: 'OK',
            },
            {
              distance: {
                text: '2,878 mi',
                value: 4632197,
              },
              duration: {
                text: '1 day 18 hours',
                value: 151772,
              },
              status: 'OK',
            },
            {
              distance: {
                text: '1,286 mi',
                value: 2069031,
              },
              duration: {
                text: '18 hours 43 mins',
                value: 67405,
              },
              status: 'OK',
            },
            {
              distance: {
                text: '1,742 mi',
                value: 2802972,
              },
              duration: {
                text: '1 day 2 hours',
                value: 93070,
              },
              status: 'OK',
            },
            {
              distance: {
                text: '2,871 mi',
                value: 4620514,
              },
              duration: {
                text: '1 day 18 hours',
                value: 152913,
              },
              status: 'OK',
            },
          ],
        },
      ],
      status: 'OK',
    },
  },
  {
    name: 'simple json meta schema',
    json: {
      type: 'object',
      allOf: [{$ref: '#/definitions/foo'}, {$ref: '#/definitions/bar'}],
      propertyNames: {
        anyOf: [{$ref: '#/definitions/fooNames'}, {$ref: '#/definitions/barNames'}],
      },
      definitions: {
        foo: {
          properties: {
            foo: {type: 'string'},
          },
        },
        fooNames: {enum: ['foo']},
        bar: {
          properties: {
            bar: {type: 'number'},
          },
        },
        barNames: {enum: ['bar']},
      },
    },
  },
  {
    name: 'advanced json schema',
    json: [
      {
        description: 'advanced schema from z-schema benchmark (https://github.com/zaggino/z-schema)',
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            '/': {$ref: '#/definitions/entry'},
          },
          patternProperties: {
            '^(/[^/]+)+$': {$ref: '#/definitions/entry'},
          },
          additionalProperties: false,
          required: ['/'],
          definitions: {
            entry: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              description: 'schema for an fstab entry',
              type: 'object',
              required: ['storage'],
              properties: {
                storage: {
                  type: 'object',
                  oneOf: [
                    {$ref: '#/definitions/entry/definitions/diskDevice'},
                    {$ref: '#/definitions/entry/definitions/diskUUID'},
                    {$ref: '#/definitions/entry/definitions/nfs'},
                    {$ref: '#/definitions/entry/definitions/tmpfs'},
                  ],
                },
                fstype: {
                  enum: ['ext3', 'ext4', 'btrfs'],
                },
                options: {
                  type: 'array',
                  minItems: 1,
                  items: {type: 'string'},
                  uniqueItems: true,
                },
                readonly: {type: 'boolean'},
              },
              definitions: {
                diskDevice: {
                  properties: {
                    type: {enum: ['disk']},
                    device: {
                      type: 'string',
                      pattern: '^/dev/[^/]+(/[^/]+)*$',
                    },
                  },
                  required: ['type', 'device'],
                  additionalProperties: false,
                },
                diskUUID: {
                  properties: {
                    type: {enum: ['disk']},
                    label: {
                      type: 'string',
                      pattern: '^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$',
                    },
                  },
                  required: ['type', 'label'],
                  additionalProperties: false,
                },
                nfs: {
                  properties: {
                    type: {enum: ['nfs']},
                    remotePath: {
                      type: 'string',
                      pattern: '^(/[^/]+)+$',
                    },
                    server: {
                      type: 'string',
                      anyOf: [{format: 'hostname'}, {format: 'ipv4'}, {format: 'ipv6'}],
                    },
                  },
                  required: ['type', 'server', 'remotePath'],
                  additionalProperties: false,
                },
                tmpfs: {
                  properties: {
                    type: {enum: ['tmpfs']},
                    sizeInMB: {
                      type: 'integer',
                      minimum: 16,
                      maximum: 512,
                    },
                  },
                  required: ['type', 'sizeInMB'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        tests: [
          {
            description: 'valid object from z-schema benchmark',
            data: {
              '/': {
                storage: {
                  type: 'disk',
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
              '/var': {
                storage: {
                  type: 'disk',
                  label: '8f3ba6f4-5c70-46ec-83af-0d5434953e5f',
                },
                fstype: 'ext4',
                options: ['nosuid'],
              },
              '/tmp': {
                storage: {
                  type: 'tmpfs',
                  sizeInMB: 64,
                },
              },
              '/var/www': {
                storage: {
                  type: 'nfs',
                  server: 'my.nfs.server',
                  remotePath: '/exports/mypath',
                },
              },
            },
            valid: true,
          },
          {
            description: 'not object',
            data: 1,
            valid: false,
          },
          {
            description: 'root only is valid',
            data: {
              '/': {
                storage: {
                  type: 'disk',
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: true,
          },
          {
            description: 'missing root entry',
            data: {
              'no root/': {
                storage: {
                  type: 'disk',
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: false,
          },
          {
            description: 'invalid entry key',
            data: {
              '/': {
                storage: {
                  type: 'disk',
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
              'invalid/var': {
                storage: {
                  type: 'disk',
                  label: '8f3ba6f4-5c70-46ec-83af-0d5434953e5f',
                },
                fstype: 'ext4',
                options: ['nosuid'],
              },
            },
            valid: false,
          },
          {
            description: 'missing storage in entry',
            data: {
              '/': {
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: false,
          },
          {
            description: 'missing storage type',
            data: {
              '/': {
                storage: {
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: false,
          },
          {
            description: 'storage type should be a string',
            data: {
              '/': {
                storage: {
                  type: null,
                  device: '/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: false,
          },
          {
            description: 'storage device should match pattern',
            data: {
              '/': {
                storage: {
                  type: null,
                  device: 'invalid/dev/sda1',
                },
                fstype: 'btrfs',
                readonly: true,
              },
            },
            valid: false,
          },
        ],
      },
    ],
  },
  {
    name: 'json schema validation',
    json: {
      'empty schema - null': {
        schema: {},
        instance: null,
        errors: [],
      },
      'empty schema - boolean': {
        schema: {},
        instance: true,
        errors: [],
      },
      'empty schema - integer': {
        schema: {},
        instance: 1,
        errors: [],
      },
      'empty schema - float': {
        schema: {},
        instance: 3.14,
        errors: [],
      },
      'empty schema - string': {
        schema: {},
        instance: 'foo',
        errors: [],
      },
      'empty schema - array': {
        schema: {},
        instance: [],
        errors: [],
      },
      'empty schema - object': {
        schema: {},
        instance: {},
        errors: [],
      },
      'empty nullable schema - null': {
        schema: {
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'empty nullable schema - object': {
        schema: {
          nullable: true,
        },
        instance: {},
        errors: [],
      },
      'empty schema with metadata - null': {
        schema: {
          metadata: {},
        },
        instance: null,
        errors: [],
      },
      'ref schema - ref to empty definition': {
        schema: {
          definitions: {
            foo: {},
          },
          ref: 'foo',
        },
        instance: true,
        errors: [],
      },
      'ref schema - nested ref': {
        schema: {
          definitions: {
            foo: {
              ref: 'bar',
            },
            bar: {},
          },
          ref: 'foo',
        },
        instance: true,
        errors: [],
      },
      'ref schema - ref to type definition, ok': {
        schema: {
          definitions: {
            foo: {
              type: 'boolean',
            },
          },
          ref: 'foo',
        },
        instance: true,
        errors: [],
      },
      'ref schema - ref to type definition, fail': {
        schema: {
          definitions: {
            foo: {
              type: 'boolean',
            },
          },
          ref: 'foo',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['definitions', 'foo', 'type'],
          },
        ],
      },
      'nullable ref schema - ref to type definition, ok': {
        schema: {
          definitions: {
            foo: {
              type: 'boolean',
            },
          },
          ref: 'foo',
          nullable: true,
        },
        instance: true,
        errors: [],
      },
      'nullable ref schema - ref to type definition, ok because null': {
        schema: {
          definitions: {
            foo: {
              type: 'boolean',
            },
          },
          ref: 'foo',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable ref schema - nullable: false ignored': {
        schema: {
          definitions: {
            foo: {
              type: 'boolean',
              nullable: false,
            },
          },
          ref: 'foo',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'ref schema - recursive schema, ok': {
        schema: {
          definitions: {
            root: {
              elements: {
                ref: 'root',
              },
            },
          },
          ref: 'root',
        },
        instance: [],
        errors: [],
      },
      'ref schema - recursive schema, bad': {
        schema: {
          definitions: {
            root: {
              elements: {
                ref: 'root',
              },
            },
          },
          ref: 'root',
        },
        instance: [[], [[]], [[[], ['a']]]],
        errors: [
          {
            instancePath: ['2', '0', '1', '0'],
            schemaPath: ['definitions', 'root', 'elements'],
          },
        ],
      },
      'boolean type schema - null': {
        schema: {
          type: 'boolean',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'boolean type schema - boolean': {
        schema: {
          type: 'boolean',
        },
        instance: true,
        errors: [],
      },
      'boolean type schema - integer': {
        schema: {
          type: 'boolean',
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'boolean type schema - float': {
        schema: {
          type: 'boolean',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'boolean type schema - string': {
        schema: {
          type: 'boolean',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'boolean type schema - array': {
        schema: {
          type: 'boolean',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'boolean type schema - object': {
        schema: {
          type: 'boolean',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable boolean type schema - null': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable boolean type schema - boolean': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: true,
        errors: [],
      },
      'nullable boolean type schema - integer': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable boolean type schema - float': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable boolean type schema - string': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable boolean type schema - array': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable boolean type schema - object': {
        schema: {
          type: 'boolean',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float32 type schema - null': {
        schema: {
          type: 'float32',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float32 type schema - boolean': {
        schema: {
          type: 'float32',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float32 type schema - integer': {
        schema: {
          type: 'float32',
        },
        instance: 1,
        errors: [],
      },
      'float32 type schema - float': {
        schema: {
          type: 'float32',
        },
        instance: 3.14,
        errors: [],
      },
      'float32 type schema - string': {
        schema: {
          type: 'float32',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float32 type schema - array': {
        schema: {
          type: 'float32',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float32 type schema - object': {
        schema: {
          type: 'float32',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float32 type schema - null': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable float32 type schema - boolean': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float32 type schema - integer': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable float32 type schema - float': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: 3.14,
        errors: [],
      },
      'nullable float32 type schema - string': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float32 type schema - array': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float32 type schema - object': {
        schema: {
          type: 'float32',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float64 type schema - null': {
        schema: {
          type: 'float64',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float64 type schema - boolean': {
        schema: {
          type: 'float64',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float64 type schema - integer': {
        schema: {
          type: 'float64',
        },
        instance: 1,
        errors: [],
      },
      'float64 type schema - float': {
        schema: {
          type: 'float64',
        },
        instance: 3.14,
        errors: [],
      },
      'float64 type schema - string': {
        schema: {
          type: 'float64',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float64 type schema - array': {
        schema: {
          type: 'float64',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'float64 type schema - object': {
        schema: {
          type: 'float64',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float64 type schema - null': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable float64 type schema - boolean': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float64 type schema - integer': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable float64 type schema - float': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: 3.14,
        errors: [],
      },
      'nullable float64 type schema - string': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float64 type schema - array': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable float64 type schema - object': {
        schema: {
          type: 'float64',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - null': {
        schema: {
          type: 'int8',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - boolean': {
        schema: {
          type: 'int8',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - integer': {
        schema: {
          type: 'int8',
        },
        instance: 1,
        errors: [],
      },
      'int8 type schema - float': {
        schema: {
          type: 'int8',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - string': {
        schema: {
          type: 'int8',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - array': {
        schema: {
          type: 'int8',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - object': {
        schema: {
          type: 'int8',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int8 type schema - null': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable int8 type schema - boolean': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int8 type schema - integer': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable int8 type schema - float': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int8 type schema - string': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int8 type schema - array': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int8 type schema - object': {
        schema: {
          type: 'int8',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - min value': {
        schema: {
          type: 'int8',
        },
        instance: -128,
        errors: [],
      },
      'int8 type schema - max value': {
        schema: {
          type: 'int8',
        },
        instance: 127,
        errors: [],
      },
      'int8 type schema - less than min': {
        schema: {
          type: 'int8',
        },
        instance: -129,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int8 type schema - more than max': {
        schema: {
          type: 'int8',
        },
        instance: 128,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - null': {
        schema: {
          type: 'uint8',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - boolean': {
        schema: {
          type: 'uint8',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - integer': {
        schema: {
          type: 'uint8',
        },
        instance: 1,
        errors: [],
      },
      'uint8 type schema - float': {
        schema: {
          type: 'uint8',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - string': {
        schema: {
          type: 'uint8',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - array': {
        schema: {
          type: 'uint8',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - object': {
        schema: {
          type: 'uint8',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint8 type schema - null': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable uint8 type schema - boolean': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint8 type schema - integer': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable uint8 type schema - float': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint8 type schema - string': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint8 type schema - array': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint8 type schema - object': {
        schema: {
          type: 'uint8',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - min value': {
        schema: {
          type: 'uint8',
        },
        instance: 0,
        errors: [],
      },
      'uint8 type schema - max value': {
        schema: {
          type: 'uint8',
        },
        instance: 255,
        errors: [],
      },
      'uint8 type schema - less than min': {
        schema: {
          type: 'uint8',
        },
        instance: -1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint8 type schema - more than max': {
        schema: {
          type: 'uint8',
        },
        instance: 256,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - null': {
        schema: {
          type: 'int16',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - boolean': {
        schema: {
          type: 'int16',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - integer': {
        schema: {
          type: 'int16',
        },
        instance: 1,
        errors: [],
      },
      'int16 type schema - float': {
        schema: {
          type: 'int16',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - string': {
        schema: {
          type: 'int16',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - array': {
        schema: {
          type: 'int16',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - object': {
        schema: {
          type: 'int16',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int16 type schema - null': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable int16 type schema - boolean': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int16 type schema - integer': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable int16 type schema - float': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int16 type schema - string': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int16 type schema - array': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int16 type schema - object': {
        schema: {
          type: 'int16',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - min value': {
        schema: {
          type: 'int16',
        },
        instance: -32768,
        errors: [],
      },
      'int16 type schema - max value': {
        schema: {
          type: 'int16',
        },
        instance: 32767,
        errors: [],
      },
      'int16 type schema - less than min': {
        schema: {
          type: 'int16',
        },
        instance: -32769,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int16 type schema - more than max': {
        schema: {
          type: 'int16',
        },
        instance: 32768,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - null': {
        schema: {
          type: 'uint16',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - boolean': {
        schema: {
          type: 'uint16',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - integer': {
        schema: {
          type: 'uint16',
        },
        instance: 1,
        errors: [],
      },
      'uint16 type schema - float': {
        schema: {
          type: 'uint16',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - string': {
        schema: {
          type: 'uint16',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - array': {
        schema: {
          type: 'uint16',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - object': {
        schema: {
          type: 'uint16',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint16 type schema - null': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable uint16 type schema - boolean': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint16 type schema - integer': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable uint16 type schema - float': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint16 type schema - string': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint16 type schema - array': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint16 type schema - object': {
        schema: {
          type: 'uint16',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - min value': {
        schema: {
          type: 'uint16',
        },
        instance: 0,
        errors: [],
      },
      'uint16 type schema - max value': {
        schema: {
          type: 'uint16',
        },
        instance: 65535,
        errors: [],
      },
      'uint16 type schema - less than min': {
        schema: {
          type: 'uint16',
        },
        instance: -1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint16 type schema - more than max': {
        schema: {
          type: 'uint16',
        },
        instance: 65536,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - null': {
        schema: {
          type: 'int32',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - boolean': {
        schema: {
          type: 'int32',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - integer': {
        schema: {
          type: 'int32',
        },
        instance: 1,
        errors: [],
      },
      'int32 type schema - float': {
        schema: {
          type: 'int32',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - string': {
        schema: {
          type: 'int32',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - array': {
        schema: {
          type: 'int32',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - object': {
        schema: {
          type: 'int32',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int32 type schema - null': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable int32 type schema - boolean': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int32 type schema - integer': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable int32 type schema - float': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int32 type schema - string': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int32 type schema - array': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable int32 type schema - object': {
        schema: {
          type: 'int32',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - min value': {
        schema: {
          type: 'int32',
        },
        instance: -2147483648,
        errors: [],
      },
      'int32 type schema - max value': {
        schema: {
          type: 'int32',
        },
        instance: 2147483647,
        errors: [],
      },
      'int32 type schema - less than min': {
        schema: {
          type: 'int32',
        },
        instance: -2147483649,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'int32 type schema - more than max': {
        schema: {
          type: 'int32',
        },
        instance: 2147483648,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - null': {
        schema: {
          type: 'uint32',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - boolean': {
        schema: {
          type: 'uint32',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - integer': {
        schema: {
          type: 'uint32',
        },
        instance: 1,
        errors: [],
      },
      'uint32 type schema - float': {
        schema: {
          type: 'uint32',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - string': {
        schema: {
          type: 'uint32',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - array': {
        schema: {
          type: 'uint32',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - object': {
        schema: {
          type: 'uint32',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint32 type schema - null': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable uint32 type schema - boolean': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint32 type schema - integer': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: 1,
        errors: [],
      },
      'nullable uint32 type schema - float': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint32 type schema - string': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint32 type schema - array': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable uint32 type schema - object': {
        schema: {
          type: 'uint32',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - min value': {
        schema: {
          type: 'uint32',
        },
        instance: 0,
        errors: [],
      },
      'uint32 type schema - max value': {
        schema: {
          type: 'uint32',
        },
        instance: 4294967295,
        errors: [],
      },
      'uint32 type schema - less than min': {
        schema: {
          type: 'uint32',
        },
        instance: -1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'uint32 type schema - more than max': {
        schema: {
          type: 'uint32',
        },
        instance: 4294967296,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - null': {
        schema: {
          type: 'string',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - boolean': {
        schema: {
          type: 'string',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - integer': {
        schema: {
          type: 'string',
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - float': {
        schema: {
          type: 'string',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - string': {
        schema: {
          type: 'string',
        },
        instance: 'foo',
        errors: [],
      },
      'string type schema - array': {
        schema: {
          type: 'string',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'string type schema - object': {
        schema: {
          type: 'string',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable string type schema - null': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable string type schema - boolean': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable string type schema - integer': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable string type schema - float': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable string type schema - string': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: 'foo',
        errors: [],
      },
      'nullable string type schema - array': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable string type schema - object': {
        schema: {
          type: 'string',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - null': {
        schema: {
          type: 'timestamp',
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - boolean': {
        schema: {
          type: 'timestamp',
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - integer': {
        schema: {
          type: 'timestamp',
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - float': {
        schema: {
          type: 'timestamp',
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - string': {
        schema: {
          type: 'timestamp',
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - array': {
        schema: {
          type: 'timestamp',
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - object': {
        schema: {
          type: 'timestamp',
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - null': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable timestamp type schema - boolean': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - integer': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - float': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - string': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - array': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'nullable timestamp type schema - object': {
        schema: {
          type: 'timestamp',
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['type'],
          },
        ],
      },
      'timestamp type schema - 1985-04-12T23:20:50.52Z': {
        schema: {
          type: 'timestamp',
        },
        instance: '1985-04-12T23:20:50.52Z',
        errors: [],
      },
      'timestamp type schema - 1996-12-19T16:39:57-08:00': {
        schema: {
          type: 'timestamp',
        },
        instance: '1996-12-19T16:39:57-08:00',
        errors: [],
      },
      'timestamp type schema - 1990-12-31T23:59:60Z': {
        schema: {
          type: 'timestamp',
        },
        instance: '1990-12-31T23:59:60Z',
        errors: [],
      },
      'timestamp type schema - 1990-12-31T15:59:60-08:00': {
        schema: {
          type: 'timestamp',
        },
        instance: '1990-12-31T15:59:60-08:00',
        errors: [],
      },
      'timestamp type schema - 1937-01-01T12:00:27.87+00:20': {
        schema: {
          type: 'timestamp',
        },
        instance: '1937-01-01T12:00:27.87+00:20',
        errors: [],
      },
      'enum schema - null': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - boolean': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - integer': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - float': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - string': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: 'foo',
        errors: [],
      },
      'enum schema - array': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - object': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'nullable enum schema - null': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable enum schema - boolean': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'nullable enum schema - integer': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'nullable enum schema - float': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'nullable enum schema - string': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: 'foo',
        errors: [],
      },
      'nullable enum schema - array': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'nullable enum schema - object': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - value not in enum': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: 'quux',
        errors: [
          {
            instancePath: [],
            schemaPath: ['enum'],
          },
        ],
      },
      'enum schema - ok': {
        schema: {
          enum: ['foo', 'bar', 'baz'],
          nullable: true,
        },
        instance: 'bar',
        errors: [],
      },
      'elements schema - null': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - boolean': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - float': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - integer': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - string': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - object': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'nullable elements schema - null': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable elements schema - boolean': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'nullable elements schema - float': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'nullable elements schema - integer': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'nullable elements schema - string': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'nullable elements schema - object': {
        schema: {
          elements: {
            type: 'string',
          },
          nullable: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['elements'],
          },
        ],
      },
      'elements schema - empty array': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: [],
        errors: [],
      },
      'elements schema - all values ok': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: ['foo', 'bar', 'baz'],
        errors: [],
      },
      'elements schema - some values bad': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: ['foo', null, null],
        errors: [
          {
            instancePath: ['1'],
            schemaPath: ['elements', 'type'],
          },
          {
            instancePath: ['2'],
            schemaPath: ['elements', 'type'],
          },
        ],
      },
      'elements schema - all values bad': {
        schema: {
          elements: {
            type: 'string',
          },
        },
        instance: [null, null, null],
        errors: [
          {
            instancePath: ['0'],
            schemaPath: ['elements', 'type'],
          },
          {
            instancePath: ['1'],
            schemaPath: ['elements', 'type'],
          },
          {
            instancePath: ['2'],
            schemaPath: ['elements', 'type'],
          },
        ],
      },
      'elements schema - nested elements, ok': {
        schema: {
          elements: {
            elements: {
              type: 'string',
            },
          },
        },
        instance: [[], ['foo'], ['foo', 'bar', 'baz']],
        errors: [],
      },
      'elements schema - nested elements, bad': {
        schema: {
          elements: {
            elements: {
              type: 'string',
            },
          },
        },
        instance: [[null], ['foo'], ['foo', null, 'baz'], null],
        errors: [
          {
            instancePath: ['0', '0'],
            schemaPath: ['elements', 'elements', 'type'],
          },
          {
            instancePath: ['2', '1'],
            schemaPath: ['elements', 'elements', 'type'],
          },
          {
            instancePath: ['3'],
            schemaPath: ['elements', 'elements'],
          },
        ],
      },
      'properties schema - null': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties schema - boolean': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties schema - float': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties schema - integer': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties schema - string': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties schema - array': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'nullable properties schema - null': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable properties schema - boolean': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'nullable properties schema - float': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'nullable properties schema - integer': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'nullable properties schema - string': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'nullable properties schema - array': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - null': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - boolean': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - float': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - integer': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - string': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'properties and optionalProperties schema - array': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties'],
          },
        ],
      },
      'optionalProperties schema - null': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'optionalProperties schema - boolean': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'optionalProperties schema - float': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'optionalProperties schema - integer': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'optionalProperties schema - string': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'optionalProperties schema - array': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['optionalProperties'],
          },
        ],
      },
      'strict properties - ok': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
        },
        errors: [],
      },
      'strict properties - bad wrong type': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['properties', 'foo', 'type'],
          },
        ],
      },
      'strict properties - bad missing property': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties', 'foo'],
          },
        ],
      },
      'strict properties - bad additional property': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [
          {
            instancePath: ['bar'],
            schemaPath: [],
          },
        ],
      },
      'strict properties - bad additional property with explicit additionalProperties: false': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [
          {
            instancePath: ['bar'],
            schemaPath: [],
          },
        ],
      },
      'non-strict properties - ok': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 'foo',
        },
        errors: [],
      },
      'non-strict properties - bad wrong type': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['properties', 'foo', 'type'],
          },
        ],
      },
      'non-strict properties - bad missing property': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['properties', 'foo'],
          },
        ],
      },
      'non-strict properties - ok additional property': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [],
      },
      'strict optionalProperties - ok': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
        },
        errors: [],
      },
      'strict optionalProperties - bad wrong type': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['optionalProperties', 'foo', 'type'],
          },
        ],
      },
      'strict optionalProperties - ok missing property': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {},
        errors: [],
      },
      'strict optionalProperties - bad additional property': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [
          {
            instancePath: ['bar'],
            schemaPath: [],
          },
        ],
      },
      'strict optionalProperties - bad additional property with explicit additionalProperties: false': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [
          {
            instancePath: ['bar'],
            schemaPath: [],
          },
        ],
      },
      'non-strict optionalProperties - ok': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 'foo',
        },
        errors: [],
      },
      'non-strict optionalProperties - bad wrong type': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['optionalProperties', 'foo', 'type'],
          },
        ],
      },
      'non-strict optionalProperties - ok missing property': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {},
        errors: [],
      },
      'non-strict optionalProperties - ok additional property': {
        schema: {
          optionalProperties: {
            foo: {
              type: 'string',
            },
          },
          additionalProperties: true,
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [],
      },
      'strict mixed properties and optionalProperties - ok': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
        },
        errors: [],
      },
      'strict mixed properties and optionalProperties - bad': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 123,
          bar: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['properties', 'foo', 'type'],
          },
          {
            instancePath: ['bar'],
            schemaPath: ['optionalProperties', 'bar', 'type'],
          },
        ],
      },
      'strict mixed properties and optionalProperties - bad additional property': {
        schema: {
          properties: {
            foo: {
              type: 'string',
            },
          },
          optionalProperties: {
            bar: {
              type: 'string',
            },
          },
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
          baz: 'baz',
        },
        errors: [
          {
            instancePath: ['baz'],
            schemaPath: [],
          },
        ],
      },
      'values schema - null': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - boolean': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - float': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - integer': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - string': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - array': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'nullable values schema - null': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable values schema - boolean': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'nullable values schema - float': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'nullable values schema - integer': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'nullable values schema - string': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'nullable values schema - array': {
        schema: {
          values: {
            type: 'string',
          },
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['values'],
          },
        ],
      },
      'values schema - empty object': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: {},
        errors: [],
      },
      'values schema - all values ok': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: {
          foo: 'foo',
          bar: 'bar',
          baz: 'baz',
        },
        errors: [],
      },
      'values schema - some values bad': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: {
          foo: 'foo',
          bar: 123,
          baz: 123,
        },
        errors: [
          {
            instancePath: ['bar'],
            schemaPath: ['values', 'type'],
          },
          {
            instancePath: ['baz'],
            schemaPath: ['values', 'type'],
          },
        ],
      },
      'values schema - all values bad': {
        schema: {
          values: {
            type: 'string',
          },
        },
        instance: {
          foo: 123,
          bar: 123,
          baz: 123,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['values', 'type'],
          },
          {
            instancePath: ['bar'],
            schemaPath: ['values', 'type'],
          },
          {
            instancePath: ['baz'],
            schemaPath: ['values', 'type'],
          },
        ],
      },
      'values schema - nested values, ok': {
        schema: {
          values: {
            values: {
              type: 'string',
            },
          },
        },
        instance: {
          a0: {
            b0: 'c',
          },
          a1: {},
          a2: {
            b0: 'c',
          },
        },
        errors: [],
      },
      'values schema - nested values, bad': {
        schema: {
          values: {
            values: {
              type: 'string',
            },
          },
        },
        instance: {
          a0: {
            b0: null,
          },
          a1: {
            b0: 'c',
          },
          a2: {
            b0: 'c',
            b1: null,
          },
          a3: null,
        },
        errors: [
          {
            instancePath: ['a0', 'b0'],
            schemaPath: ['values', 'values', 'type'],
          },
          {
            instancePath: ['a2', 'b1'],
            schemaPath: ['values', 'values', 'type'],
          },
          {
            instancePath: ['a3'],
            schemaPath: ['values', 'values'],
          },
        ],
      },
      'discriminator schema - null': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: null,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - boolean': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - float': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - integer': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - string': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - array': {
        schema: {
          discriminator: 'foo',
          mapping: {},
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'nullable discriminator schema - null': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: null,
        errors: [],
      },
      'nullable discriminator schema - boolean': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: true,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'nullable discriminator schema - float': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: 3.14,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'nullable discriminator schema - integer': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: 1,
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'nullable discriminator schema - string': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: 'foo',
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'nullable discriminator schema - array': {
        schema: {
          discriminator: 'foo',
          mapping: {},
          nullable: true,
        },
        instance: [],
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - discriminator missing': {
        schema: {
          discriminator: 'foo',
          mapping: {
            x: {
              properties: {
                a: {
                  type: 'string',
                },
              },
            },
            y: {
              properties: {
                a: {
                  type: 'float64',
                },
              },
            },
          },
        },
        instance: {},
        errors: [
          {
            instancePath: [],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - discriminator not string': {
        schema: {
          discriminator: 'foo',
          mapping: {
            x: {
              properties: {
                a: {
                  type: 'string',
                },
              },
            },
            y: {
              properties: {
                a: {
                  type: 'float64',
                },
              },
            },
          },
        },
        instance: {
          foo: null,
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['discriminator'],
          },
        ],
      },
      'discriminator schema - discriminator not in mapping': {
        schema: {
          discriminator: 'foo',
          mapping: {
            x: {
              properties: {
                a: {
                  type: 'string',
                },
              },
            },
            y: {
              properties: {
                a: {
                  type: 'float64',
                },
              },
            },
          },
        },
        instance: {
          foo: 'z',
        },
        errors: [
          {
            instancePath: ['foo'],
            schemaPath: ['mapping'],
          },
        ],
      },
      'discriminator schema - instance fails mapping schema': {
        schema: {
          discriminator: 'foo',
          mapping: {
            x: {
              properties: {
                a: {
                  type: 'string',
                },
              },
            },
            y: {
              properties: {
                a: {
                  type: 'float64',
                },
              },
            },
          },
        },
        instance: {
          foo: 'y',
          a: 'a',
        },
        errors: [
          {
            instancePath: ['a'],
            schemaPath: ['mapping', 'y', 'properties', 'a', 'type'],
          },
        ],
      },
      'discriminator schema - ok': {
        schema: {
          discriminator: 'foo',
          mapping: {
            x: {
              properties: {
                a: {
                  type: 'string',
                },
              },
            },
            y: {
              properties: {
                a: {
                  type: 'float64',
                },
              },
            },
          },
        },
        instance: {
          foo: 'x',
          a: 'a',
        },
        errors: [],
      },
    },
  },
];
