import {RandomJson} from '@jsonjoy.com/util/lib/json-random';
import {assertPatch} from './util';
import {diffEdit} from '../diff';

const str = () => Math.random() > .7 ? RandomJson.genString() : Math.random().toString(36).slice(2);

test('fuzzing diff() and diffEdit()', () => {
  for (let i = 0; i < 200; i++) {
    const src = str();
    const dst = str();
    assertPatch(src, dst);
    const patch = diffEdit(src, dst, Math.floor(Math.random() * src.length));
    assertPatch(src, dst, patch);
  }
});
