export interface OtType<Document, Operation> {
  /** Should return a falsy value if operation is valid. */
  validate: (op: Operation) => unknown;
  normalize: (op: Operation) => Operation;
  apply: (document: Document, op: Operation) => Document;
  compose: (op1: Operation, op2: Operation) => Operation;
  transform: (op: Operation, against: Operation, leftWins: boolean) => Operation;
}
