import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {toBuf} from '@jsonjoy.com/util/lib/buffers/toBuf';
import {assertPatch} from './util';
import * as bin from '../bin';

const str = () => Math.random() > .7
  ? RandomJson.genString(Math.ceil(Math.random() * 200))
  : Math.random().toString(36).slice(2);
const iterations = 100;

test('fuzzing diff()', () => {
  for (let i = 0; i < iterations; i++) {
    const src = toBuf(str());
    const dst = toBuf(str());
    const patch = bin.diff(src, dst);
    assertPatch(bin.toStr(src), bin.toStr(dst), patch);
    expect(bin.src(patch)).toEqual(src);
    expect(bin.dst(patch)).toEqual(dst);
  }
});
