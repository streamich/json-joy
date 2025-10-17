import type {Operation} from '../../json-patch';

export interface TestCase {
  comment: string;
  doc: unknown;
  patch: Operation[];
  expected?: unknown;
  error?: string;
  disabled?: boolean;
  only?: boolean;
  /** Whether to skip this operation in `json-ot` tests. */
  skipInJsonOt?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  /** Whether the test suite tests the JSON Patch core specification. */
  isJsonPatchSpec?: boolean;
}
