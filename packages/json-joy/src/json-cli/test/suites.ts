import tests_json from './tests.json';
import op_add_tests_json from './op.add.tests.json';
import op_replace_tests_json from './op.replace.tests.json';
import op_remove_tests_json from './op.remove.tests.json';
import op_move_tests_json from './op.move.tests.json';
import op_copy_tests_json from './op.copy.tests.json';
import op_test_tests_json from './op.test.tests.json';
import op_str_ins_tests_json from './op.str_ins.tests.json';
import op_str_del_tests_json from './op.str_del.tests.json';
import op_flip_tests_json from './op.flip.tests.json';
import op_inc_tests_json from './op.inc.tests.json';
import op_split_tests_json from './op.split.tests.json';
import op_merge_tests_json from './op.merge.tests.json';
import op_extend_tests_json from './op.extend.tests.json';
import op_contains_tests_json from './op.contains.tests.json';
import op_defined_tests_json from './op.defined.tests.json';
import op_ends_tests_json from './op.ends.tests.json';
import op_in_tests_json from './op.in.tests.json';
import op_less_tests_json from './op.less.tests.json';
import op_more_tests_json from './op.more.tests.json';
import op_starts_tests_json from './op.starts.tests.json';
import op_type_tests_json from './op.type.tests.json';
import op_undefined_tests_json from './op.undefined.tests.json';
import spec_json from './spec.json';
import type {TestSuite} from './types';

export const testSuites: TestSuite[] = [
  // JSON Patch
  {
    name: 'JSON Patch spec',
    tests: spec_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch smoke tests',
    tests: tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "add" operation',
    tests: op_add_tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "replace" operation',
    tests: op_replace_tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "remove" operation',
    tests: op_remove_tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "move" operation',
    tests: op_move_tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "copy" operation',
    tests: op_copy_tests_json,
    isJsonPatchSpec: true,
  },
  {
    name: 'JSON Patch "test" operation',
    tests: op_test_tests_json,
    isJsonPatchSpec: true,
  },

  // JSON Patch Extended.
  {
    name: 'JSON Patch Extended "str_ins" operation',
    tests: op_str_ins_tests_json,
  },
  {
    name: 'JSON Patch Extended "str_del" operation',
    tests: op_str_del_tests_json,
  },
  {
    name: 'JSON Patch Extended "flip" operation',
    tests: op_flip_tests_json,
  },
  {
    name: 'JSON Patch Extended "inc" operation',
    tests: op_inc_tests_json,
  },

  // JSON Patch for Slate.js
  {
    name: 'JSON Patch for Slate.js "split" operation',
    tests: op_split_tests_json,
  },
  {
    name: 'JSON Patch for Slate.js "merge" operation',
    tests: op_merge_tests_json,
  },
  {
    name: 'JSON Patch for Slate.js "extend" operation',
    tests: op_extend_tests_json,
  },

  // JSON Predicate
  {
    name: 'JSON Predicate "contains" operation',
    tests: op_contains_tests_json,
  },
  {
    name: 'JSON Predicate "defined" operation',
    tests: op_defined_tests_json,
  },
  {
    name: 'JSON Predicate "ends" operation',
    tests: op_ends_tests_json,
  },
  {
    name: 'JSON Predicate "in" operation',
    tests: op_in_tests_json,
  },
  {
    name: 'JSON Predicate "less" operation',
    tests: op_less_tests_json,
  },
  {
    name: 'JSON Predicate "more" operation',
    tests: op_more_tests_json,
  },
  {
    name: 'JSON Predicate "starts" operation',
    tests: op_starts_tests_json,
  },
  {
    name: 'JSON Predicate "type" operation',
    tests: op_type_tests_json,
  },
  {
    name: 'JSON Predicate "undefined" operation',
    tests: op_undefined_tests_json,
  },
];
