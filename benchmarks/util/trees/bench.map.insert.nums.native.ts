// npx ts-node benchmarks/util/trees/bench.map.insert.nums.native.ts

import {runBenchmark, Benchmark} from '../../bench/runBenchmark';
import {AvlBstNumNumMap} from '../../../src/util/trees/avl/AvlBstNumNumMap';
import {Tree} from '../../../src/util/trees/Tree';
import {RadixTree} from '../../../src/util/trees/radix/RadixTree';
import * as payloads from './payloads';

const benchmark: Benchmark = {
  name: 'Numeric inserts into maps',
  warmup: 1000,
  payloads: payloads.numbers,
  runners: [
    {
      name: 'Array[number]<number>',
      setup: () => {
        return (num: unknown) => {
          const map: Array<number> = [];
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map[key] = key;
          }
        };
      },
    },
    {
      name: 'Record<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map: Record<number, number> = {};
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map[key] = key;
          }
        };
      },
    },
    {
      name: 'Map<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new Map<number, number>();
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map.set(key, key);
          }
        };
      },
    },
    {
      name: 'json-joy AvlBstNumNumMap',
      setup: () => {
        return (num: unknown) => {
          const map = new AvlBstNumNumMap();
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map.set(key, key);
          }
        };
      },
    },
    {
      name: 'json-joy Tree<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new Tree<number, number>();
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map.set(key, key);
          }
        };
      },
    },
    {
      name: 'json-joy RadixTree',
      setup: () => {
        return (num: unknown) => {
          const map = new RadixTree();
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map.set('' + key, key);
          }
        };
      },
    },
  ],
};

runBenchmark(benchmark);
