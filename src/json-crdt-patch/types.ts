export type CrdtCreateObjectOperationCompactFull = [op: 0, depSessionId: number, depTime: number];
export type CrdtCreateObjectOperationCompact = 0 | CrdtCreateObjectOperationCompactFull;
export interface CrdtCreateObjectOperation {
  op: 'obj_new';
  path?: string;
}

export type CrdtSetObjectFieldOperationCompact = [op: 1, depSessionId: number, depTime: number, key: string, value: null | boolean | number];
export interface CrdtSetObjectFieldOperation {
  op: 'obj_ins';
  path?: string;
  key: string;
}


export type CrdtCreateArrayOperationCompact = 2 | [op: 2, path: string];
export interface CrdtCreateArrayOperation {
  op: 'arr_new';
  path?: string;
}


export type CrdtArrayInsertOperationCompact = [op: 3, val: unknown, path?: string];
export interface CrdtArrayInsertOperation {
  op: 'arr_ins';
  path?: string;
  val: unknown;
}

export type CrdtCreateStringOperationCompact = 4 | [op: 4, path: string];
export interface CrdtCreateStringOperation {
  op: 'str_new';
  path?: string;
}

export type CrdtInsertStringOperationCompact = [op: 5, str: string, path?: string];
export interface CrdtInsertStringOperation {
  op: 'str_ins';
  path?: string;
  str: string;
}

export type CrdtDeleteOperationCompact = [op: 6, path: string];
export interface CrdtDeleteOperation {
  op: 'del';
  path: string;
}

export type CrdtOperation =
  | CrdtCreateObjectOperation
  | CrdtSetObjectFieldOperation
  | CrdtCreateArrayOperation
  | CrdtArrayInsertOperation
  | CrdtCreateStringOperation
  | CrdtInsertStringOperation
  | CrdtDeleteOperation;

export type CrdtOperationCompact =
  | CrdtCreateObjectOperationCompact
  | CrdtSetObjectFieldOperationCompact
  | CrdtCreateArrayOperationCompact
  | CrdtArrayInsertOperationCompact
  | CrdtCreateStringOperationCompact
  | CrdtInsertStringOperationCompact
  | CrdtDeleteOperationCompact;

export interface CrdtPatch {
  sessionId: number;
  time: number;
  span: number;
  ops: CrdtOperation[];
}

export type CrdtPatchCompact = [sessionId: number, time: number, ops: CrdtOperationCompact[]];
