import {RandomJson} from '@jsonjoy.com/json-random';
import {assertDiff} from './line';
import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';

const iterations = 100;
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
  for (let i = 0; i < 1000; i++) {
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
