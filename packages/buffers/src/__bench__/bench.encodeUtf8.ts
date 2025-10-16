// yarn build && npx ts-node src/__bench__/bench.encodeUtf8.ts

import {runBenchmark} from './runBenchmark';
import {Writer} from '../Writer';

const hasBuffer = typeof Buffer === 'function';

const compareBuffers = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const benchmark = {
  name: 'encodeUtf8',
  warmup: 1000,
  payloads: [
    {
      name: (data: any) => `Single character, ${new TextEncoder().encode(data).length} bytes`,
      data: 'a',
    },
    {
      name: (data: any) => `"Hello", ${new TextEncoder().encode(data).length} bytes`,
      data: 'Hello',
    },
    {
      name: (data: any) => `Short text with emoji, ${new TextEncoder().encode(data).length} bytes`,
      data: 'Hi, Mike 👋!',
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'a'.repeat(2),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'a'.repeat(4),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'a'.repeat(8),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(3),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(4),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(8),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(16),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(32),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(64),
    },
    {
      name: (data: any) => `Repeating ASCII characters, ${new TextEncoder().encode(data).length} bytes`,
      data: 'abcd'.repeat(128),
    },
    {
      name: (data: any) => `Multibyte characters (Latin-1), ${new TextEncoder().encode(data).length} bytes`,
      data: 'ä'.repeat(64),
    },
    {
      name: (data: any) => `Multibyte characters (Latin-1), ${new TextEncoder().encode(data).length} bytes`,
      data: 'ä'.repeat(128),
    },
    {
      name: (data: any) => `CJK characters, ${new TextEncoder().encode(data).length} bytes`,
      data: '中'.repeat(32),
    },
    {
      name: (data: any) => `CJK characters, ${new TextEncoder().encode(data).length} bytes`,
      data: '中'.repeat(64),
    },
    {
      name: (data: any) => `Emoji, ${new TextEncoder().encode(data).length} bytes`,
      data: '😀'.repeat(16),
    },
    {
      name: (data: any) => `Emoji, ${new TextEncoder().encode(data).length} bytes`,
      data: '😀'.repeat(32),
    },
    {
      name: (data: any) => `Mixed scripts, ${new TextEncoder().encode(data).length} bytes`,
      data: 'Hello мир 中国 🌍'.repeat(8),
    },
    {
      name: (data: any) => `Mixed scripts, ${new TextEncoder().encode(data).length} bytes`,
      data: 'Hello мир 中国 🌍'.repeat(16),
    },
  ],
  test: (data: any, result: any) => {
    const expected = new TextEncoder().encode(data);
    return compareBuffers(result, expected);
  },
  runners: [
    {
      name: 'TextEncoder',
      setup: () => {
        const encoder = new TextEncoder();
        return (data: any) => encoder.encode(data);
      },
    },
    ...(hasBuffer
      ? [
          {
            name: 'Buffer.from()',
            setup: () => (data: any) => new Uint8Array(Buffer.from(data, 'utf8')),
          },
        ]
      : []),
    {
      name: 'Writer.utf8()',
      setup: () => {
        const writer = new Writer();
        return (data: any) => {
          writer.ensureCapacity(data.length * 4);
          writer.utf8(data);
          return writer.flush();
        };
      },
    },
    {
      name: 'Writer.utf8Native()',
      setup: () => {
        const writer = new Writer();
        return (data: any) => {
          writer.ensureCapacity(data.length * 4);
          writer.utf8Native(data);
          return writer.flush();
        };
      },
    },
    {
      name: 'Writer.ascii() (ASCII only)',
      setup: () => {
        const writer = new Writer();
        return (data: any) => {
          writer.ensureCapacity(data.length);
          writer.ascii(data);
          return writer.flush();
        };
      },
    },
  ],
};

runBenchmark(benchmark);
