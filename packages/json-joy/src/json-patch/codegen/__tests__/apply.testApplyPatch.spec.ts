import {testApplyPatch} from '../../applyPatch/__tests__/testApplyPatch';
import {apply} from '../apply';

testApplyPatch(
  (doc, patch, options) => {
    doc = apply(patch, options, doc);
    return {doc, res: []};
  },
  {dontTestResultHistory: true},
);
