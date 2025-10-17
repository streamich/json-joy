import type {ApplyPatch} from '../types';
import {testContainsOp} from './ops/contains';
import {testDefinedOp} from './ops/defined';
import {testEndsOp} from './ops/ends';
import {testExtendOp} from './ops/extend';
import {testFlipOp} from './ops/flip';
import {testInOp} from './ops/in';
import {testIncOp} from './ops/inc';
import {testLessOp} from './ops/less';
import {testMatchesOp} from './ops/matches';
import {testMergeOp} from './ops/merge';
import {testMoreOp} from './ops/more';
import {testSplitOp} from './ops/split';
import {testStartsOp} from './ops/starts';
import {testStrDelOp} from './ops/str_del';
import {testStrInsOp} from './ops/str_ins';
import {testTestOp} from './ops/test';
import {testTestString} from './ops/test_string';
import {testTestStrLenOp} from './ops/test_string_len';
import {testTestTypeOp} from './ops/test_type';
import {testTypeOp} from './ops/type';
import {testUndefinedOp} from './ops/undefined';
import {smokeTestApplyPatch} from './smokeTestApplyPatch';
import {testApplyPatchAutomated} from './testApplyPatchAutomated';

interface Options {
  dontTestResultHistory?: boolean;
}

export const testApplyPatch = (applyPatch: ApplyPatch, options: Options = {}) => {
  smokeTestApplyPatch(applyPatch, options);
  testApplyPatchAutomated(applyPatch);
  describe('applyPatch [by operation]', () => {
    // predicate ops
    testTestOp(applyPatch);
    testStartsOp(applyPatch);
    testEndsOp(applyPatch);
    testContainsOp(applyPatch);
    testDefinedOp(applyPatch);
    testLessOp(applyPatch);
    testMoreOp(applyPatch);
    testMatchesOp(applyPatch);
    testTypeOp(applyPatch);
    testTestStrLenOp(applyPatch);
    testTestTypeOp(applyPatch);
    testInOp(applyPatch);
    testUndefinedOp(applyPatch);
    testTestString(applyPatch);

    // string ops
    testStrInsOp(applyPatch);
    testStrDelOp(applyPatch);

    // JSON Patch+
    testIncOp(applyPatch);
    testFlipOp(applyPatch);

    // Slate.js ops
    testSplitOp(applyPatch);
    testMergeOp(applyPatch);
    testExtendOp(applyPatch);
  });
};
