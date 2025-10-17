import {testApplyPatchAutomated} from '../../applyPatch/__tests__/testApplyPatchAutomated';
import {apply} from '../apply';

testApplyPatchAutomated((doc, patch, options) => {
  doc = apply(patch, options, doc);
  return {doc, res: []};
});
