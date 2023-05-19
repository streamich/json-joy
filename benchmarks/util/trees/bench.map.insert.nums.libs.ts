// npx ts-node benchmarks/util/trees/bench.map.insert.nums.libs.ts

import {runBenchmark, Benchmark} from '../../bench/runBenchmark';
import {AvlBstNumNumMap} from '../../../src/util/trees/avl/AvlBstNumNumMap';
import {RbMap} from '../../../src/util/trees/red-black/RbMap';
import {AvlBstMap} from '../../../src/util/trees/avl/AvlBstMap';
import {Tree} from '../../../src/util/trees/Tree';
import {RadixTree} from '../../../src/util/trees/radix/RadixTree';
import BTree from 'sorted-btree';
import {OrderedMap} from 'js-sdsl';
import * as payloads from './payloads';

const benchmark: Benchmark = {
  name: 'Numeric inserts into maps',
  warmup: 1000,
  payloads: payloads.numbers,
  runners: [
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
      name: 'json-joy AvlBstMap<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new AvlBstMap<number, number>();
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
      name: 'json-joy RbMap<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new RbMap<number, number>();
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
    {
      name: 'sorted-btree BTree<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new BTree<number, number>();
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
      name: 'js-sdsl OrderedMap<number, number>',
      setup: () => {
        return (num: unknown) => {
          const map = new OrderedMap<number, number>();
          const numbers = num as number[];
          const length = numbers.length;
          for (let i = 0; i < length; i++) {
            const key = numbers[i];
            map.setElement(key, key);
          }
        };
      },
    },
  ],
};

runBenchmark(benchmark);
