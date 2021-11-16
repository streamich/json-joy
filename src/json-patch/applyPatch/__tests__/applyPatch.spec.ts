import {applyPatch as v1} from '../v1';
import {applyPatch as v4} from '../v4';
import {testApplyPatch} from './testApplyPatch';

const versions = {v1, v4};

for (const name in versions) {
  const applyPatch = (versions as any)[name];
  describe(`applyPatch ${name}`, () => {
    testApplyPatch(applyPatch);
  });
}
