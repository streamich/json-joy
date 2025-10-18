/* tslint:disable no-console */

// npx ts-node src/json-size/__bench__/json-size.ts

import * as Benchmark from 'benchmark';
import {utf8Size} from '../../strings/utf8';
import {jsonSize, jsonSizeApprox} from '../json';
import {jsonSizeFast} from '../jsonSizeFast';

const json = [
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
        longString:
          'lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum, lorem ipsum dolorem, alamorem colomorem, ipsum pipsum',
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
        '👍': 33,
      },
    },
  },
];

const suite = new Benchmark.Suite();

suite
  .add(`json-joy/json-size jsonSize()`, () => {
    jsonSize(json);
  })
  .add(`json-joy/json-size jsonSizeApprox()`, () => {
    jsonSizeApprox(json);
  })
  .add(`json-joy/json-size jsonSizeFast()`, () => {
    jsonSizeFast(json);
  })
  .add(`JSON.stringify`, () => {
    JSON.stringify(json).length;
  })
  .add(`JSON.stringify + utf8Count`, () => {
    utf8Size(JSON.stringify(json));
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target) + `, ${Math.round(1000000000 / event.target.hz)} ns/op`);
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
