import {RandomJson} from '@jsonjoy.com/json-random';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {assertDiff} from './line';
import {int, logSeed, pick} from './rnd';
import {rounds} from './util';

const iterations = rounds(100);
const minElements = 2;
const maxElements = 6;

test('produces valid patch', () => {
  for (let i = 0; i < iterations; i++) {
    const elements = minElements + Math.ceil(Math.random() * (maxElements - minElements));
    const src: string[] = [];
    const dst: string[] = [];
    for (let i = 0; i < elements; i++) {
      const json = RandomJson.generate({nodeCount: 5});
      if (Math.random() > 0.5) {
        src.push(JSON.stringify(json));
      }
      if (Math.random() > 0.5) {
        dst.push(JSON.stringify(json));
      }
    }
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.log('SRC', src);
      console.log('DST', dst);
      throw error;
    }
  }
});

const generateString = (length: number): string => {
  let str = '';
  for (let i = 0; i < length; i++) str += Fuzzer.randomInt(0, 4);
  return str;
};

const generateArray = (length: number = Fuzzer.randomInt(0, 5)): string[] => {
  const arr: string[] = [];
  for (let i = 0; i < length; i++) {
    const str = generateString(Fuzzer.randomInt(0, 6));
    arr.push(str);
  }
  return arr;
};

test('produces valid patch - 2', () => {
  for (let i = 0; i < rounds(1000); i++) {
    const src: string[] = generateArray();
    const dst: string[] = generateArray();
    try {
      assertDiff(src, dst);
    } catch (error) {
      console.log('SRC', src);
      console.log('DST', dst);
      throw error;
    }
    try {
      assertDiff(dst, src);
    } catch (error) {
      console.log('SRC', dst);
      console.log('DST', src);
      throw error;
    }
  }
});

test('duplicate-heavy unicode lines with edits, moves, and duplications', () => {
  // Small pool so duplicate lines are common.
  const pool = ['', ' ', 'const x = 1;', 'const x = 1;', '}', 'line', '😀 emoji line', '中文行', 'é'];
  for (let i = 0; i < rounds(300); i++) {
    const src: string[] = [];
    const len = int(40);
    for (let j = 0; j < len; j++) src.push(pick(pool));
    const dst = [...src];
    const edits = 1 + int(5);
    for (let e = 0; e < edits; e++) {
      switch (int(5)) {
        case 0:
          dst.splice(int(dst.length + 1), 0, pick(pool));
          break;
        case 1:
          dst.splice(int(dst.length + 1), int(3));
          break;
        case 2:
          if (dst.length) dst[int(dst.length)] += ' edited';
          break;
        case 3: {
          const block = dst.splice(int(dst.length + 1), int(4));
          dst.splice(int(dst.length + 1), 0, ...block);
          break;
        }
        case 4:
          if (dst.length) dst.splice(int(dst.length + 1), 0, dst[int(dst.length)]);
          break;
      }
    }
    try {
      assertDiff(src, dst);
    } catch (error) {
      logSeed({src, dst});
      throw error;
    }
  }
});
