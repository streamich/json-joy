import {applyPatch as v1} from '../v1';
import {applyPatch as v2} from '../v2';
import {applyPatch as v3} from '../v3';
import {applyPatch as v4} from '../v4';
import {testApplyPatch} from './testApplyPatch';

const versions = {v1, v4};
// const versions = {v3};

for (const name in versions) {
  const applyPatch = (versions as any)[name];
  testApplyPatch(applyPatch);
}
