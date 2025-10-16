import type {BinaryOp} from '../ot-binary-irreversible/types';
import type {EDIT_TYPE} from './constants';
import type {Expr} from '@jsonjoy.com/json-expression';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {StringOp} from '../ot-string-irreversible/types';

export type JsonOpTestComponent = Expr;
export type JsonOpPickComponent = [register: number, path: Path]; // TODO: Allow path to be JSON Pointer string?
export type JsonOpDataComponent = [register: number, data: unknown];
export type JsonOpDropComponent = [register: number, path: Path]; // TODO: Allow path to be JSON Pointer string?
export type JsonOpEditComponent = JsonOpEditComponentOtString | JsonOpEditComponentOtBinary;

export type JsonOpEditComponentOtString = [type: EDIT_TYPE.OT_STRING, path: Path, operation: StringOp];
export type JsonOpEditComponentOtBinary = [type: EDIT_TYPE.OT_BINARY, path: Path, operation: BinaryOp];

export type JsonOp = [
  test: JsonOpTestComponent[],
  pick?: JsonOpPickComponent[],
  data?: JsonOpDataComponent[],
  drop?: JsonOpDropComponent[],
  edit?: JsonOpEditComponent[],
];
