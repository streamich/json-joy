// yarn build && npx ts-node src/buffers/__bench__/bench.decodeUtf8.ts

import {runBenchmark} from './runBenchmark';

const prepare = (str: string) => {
  const buf = Buffer.from(str);
  const arr = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) arr[i] = buf[i];
  return arr;
};

const runner = (v: number, name: string) => ({
  name: `${name} (v${v})`,
  setup: () => {
    const decode = require('../../../lib/buffers/utf8/decodeUtf8/v' + v).default;
    return (data: any) => decode(data, 0, data.length);
  },
});

const benchmark = {
  name: 'decodeUtf8',
  warmup: 1000,
  payloads: [
    // {
    //   name: (buf) => `Single character, ${buf.length} bytes`,
    //   data: prepare('a'),
    //   test: () => 'a',
    // },
    // {
    //   name: (buf) => `"Hello", ${buf.length} bytes`,
    //   data: prepare('Hello'),
    //   test: () => 'Hello',
    // },
    // {
    //   name: (buf) => `Short text with emoji, ${buf.length} bytes`,
    //   data: prepare('Hi, Mike 👋!'),
    //   test: () => 'Hi, Mike 👋!',
    // },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('a'.repeat(2)),
      test: () => 'a'.repeat(2),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('a'.repeat(4)),
      test: () => 'a'.repeat(4),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('a'.repeat(8)),
      test: () => 'a'.repeat(8),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(3)),
      test: () => 'abcd'.repeat(3),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(4)),
      test: () => 'abcd'.repeat(4),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(8)),
      test: () => 'abcd'.repeat(8),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(16)),
      test: () => 'abcd'.repeat(16),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(32)),
      test: () => 'abcd'.repeat(32),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(64)),
      test: () => 'abcd'.repeat(64),
    },
    {
      name: (buf: any) => `Repeating characters, ${buf.length} bytes`,
      data: prepare('abcd'.repeat(128)),
      test: () => 'abcd'.repeat(128),
    },
  ],
  runners: [
    // runner(1, 'JS with buffering in array'),
    // runner(2, 'Buffer.prototype.utf8Slice'),
    // runner(3, 'Buffer.from(arr).slice'),
    // runner(4, 'Buffer.from(arr).subarray'),
    // runner(5, 'JS with string concatenation'),
    // runner(6, 'TextDecoder'),
    // runner(7, 'JS with buffering in array, no flushing'),
    // runner(8, 'JS with buffering in array, small buffer'),
    // runner(9, 'JS with buffering in array, variable reuse'),
    // runner(10, 'JS with string concatenation, variable reuse'),
    runner(19, 'json-pack-napi'),
    runner(11, 'utf8Slice'),
    // runner(12, 'from(arr).subarray'),
    // runner(13, 'composition'),
  ],
};

runBenchmark(benchmark);
