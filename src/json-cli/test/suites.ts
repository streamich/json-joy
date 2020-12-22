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
import spec_json from './spec.json';
import {TestSuite} from './types';

export const testSuites: TestSuite[] = [
  {
    name: 'JSON Patch spec',
    tests: spec_json,
  },
  {
    name: 'JSON Patch smoke tests',
    tests: tests_json,
  },
  {
    name: 'JSON Patch "add" operation',
    tests: op_add_tests_json,
  },
  {
    name: 'JSON Patch "replace" operation',
    tests: op_replace_tests_json,
  },
  {
    name: 'JSON Patch "remove" operation',
    tests: op_remove_tests_json,
  },
  {
    name: 'JSON Patch "move" operation',
    tests: op_move_tests_json,
  },
  {
    name: 'JSON Patch "copy" operation',
    tests: op_copy_tests_json,
  },
  {
    name: 'JSON Patch "test" operation',
    tests: op_test_tests_json,
  },
  {
    name: 'JSON Patch "str_ins" operation',
    tests: op_str_ins_tests_json,
  },
  {
    name: 'JSON Patch "str_del" operation',
    tests: op_str_del_tests_json,
  },
  {
    name: 'JSON Patch "flip" operation',
    tests: op_flip_tests_json,
  },
];
