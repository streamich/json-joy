/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import {parseJsonPointer} from '../util';

const suite = new Benchmark.Suite();

suite
  .add(`parseJsonPointer ""`, () => {
    parseJsonPointer('');
  })
  .add(`parseJsonPointer "/"`, () => {
    parseJsonPointer('/');
  })
  .add(`parseJsonPointer "/foo"`, () => {
    parseJsonPointer('/foo');
  })
  .add(`parseJsonPointer "/foo/bar/baz"`, () => {
    parseJsonPointer('/foo/bar/baz');
  })
  .add(`parseJsonPointer "/foo/bar/baz/layer~0/123/ok~1test/4"`, () => {
    parseJsonPointer('/foo/bar/baz/layer~0/123/ok~1test/4');
  })
  .on('cycle', (event: any) => {
    console.log(String(event.target));
  })
  .on('complete', () => {
    console.log('Fastest is ' + suite.filter('fastest').map('name'));
  })
  .run();
