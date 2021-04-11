import {Operation} from '../../json-patch';

export interface TestCase {
  comment: string;
  doc: unknown;
  patch: Operation[];
  expected?: unknown;
  error?: string;
  disabled?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
}
