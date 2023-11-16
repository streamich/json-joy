/** A module declaration, e.g. "namespace Foo {". */
export interface TsModuleDeclaration {
  node: 'ModuleDeclaration';
  name: string;
  statements: TsDeclaration[];
  comment?: string;
  export?: boolean;
}

/** An interface declaration, e.g. "interface Bar {". */
export interface TsInterfaceDeclaration {
  node: 'InterfaceDeclaration';
  name: string;
  members: Array<TsPropertySignature | TsIndexSignature>;
  comment?: string;
  export?: boolean;
}

/** A property of an interface type. */
export interface TsPropertySignature {
  node: 'PropertySignature';
  name: string;
  type: TsType;
  optional?: boolean;
  comment?: string;
}

/** An index interface signature, e.g. "[key: string]: unknown". */
export interface TsIndexSignature {
  node: 'IndexSignature';
  type: TsType;
}

/** A type alias declaration, e.g. "type Baz = ...". */
export interface TsTypeAliasDeclaration {
  node: 'TypeAliasDeclaration';
  name: string;
  type: TsType;
  comment?: string;
  export?: boolean;
}

/** All possible declarations that can be statements of a module. */
export type TsDeclaration = TsModuleDeclaration | TsInterfaceDeclaration | TsTypeAliasDeclaration;

/** An "Array<*>" type. */
export interface TsArrayType {
  node: 'ArrayType';
  elementType: TsType;
}

export interface TsTupleType {
  node: 'TupleType';
  elements: TsType[];
}

/** "string" */
export interface TsStringKeyword {
  node: 'StringKeyword';
}

/** "number" */
export interface TsNumberKeyword {
  node: 'NumberKeyword';
}

/** "boolean" */
export interface TsBooleanKeyword {
  node: 'BooleanKeyword';
}

/** "null" */
export interface TsNullKeyword {
  node: 'NullKeyword';
}

/** "any" */
export interface TsAnyKeyword {
  node: 'AnyKeyword';
}

/** "object" */
export interface TsObjectKeyword {
  node: 'ObjectKeyword';
}

/** "unknown" */
export interface TsUnknownKeyword {
  node: 'UnknownKeyword';
}

/** Inline interface type. */
export interface TsTypeLiteral {
  node: 'TypeLiteral';
  members: Array<TsPropertySignature | TsIndexSignature>;
  comment?: string;
}

/** Exact string as type. */
export interface TsStringLiteral {
  node: 'StringLiteral';
  text: string;
}

/** Exact number as type. */
export interface TsNumericLiteral {
  node: 'NumericLiteral';
  text: string;
}

/** "true" */
export interface TsTrueKeyword {
  node: 'TrueKeyword';
}

/** "false" */
export interface TsFalseKeyword {
  node: 'FalseKeyword';
}

/** List of types separated by "|" pipe. */
export interface TsUnionType {
  node: 'UnionType';
  types: TsType[];
}

export interface TsIdentifier {
  node: 'Identifier';
  name: string;
}

export interface TsGenericTypeAnnotation {
  node: 'GenericTypeAnnotation';
  id: TsIdentifier;
}

/** A reference to a type alias, e.g. "foo: Reference". */
export interface TsTypeReference {
  node: 'TypeReference';
  typeName: string | TsIdentifier;
  typeArguments?: TsType[];
}

export interface TsFunctionType {
  node: 'FunctionType';
  parameters: TsParameter[];
  type: TsType;
}

export interface TsParameter {
  node: 'Parameter';
  name: TsIdentifier;
  type: TsType;
}

/** All type annotations. */
export type TsType =
  | TsAnyKeyword
  | TsUnknownKeyword
  | TsNullKeyword
  | TsBooleanKeyword
  | TsTrueKeyword
  | TsFalseKeyword
  | TsNumberKeyword
  | TsStringKeyword
  | TsStringLiteral
  | TsArrayType
  | TsTupleType
  | TsObjectKeyword
  | TsTypeLiteral
  | TsNumericLiteral
  | TsUnionType
  | TsTypeReference
  | TsGenericTypeAnnotation
  | TsFunctionType;

/** Any possible TypeScript AST node. */
export type TsNode = TsDeclaration | TsType | TsPropertySignature | TsIndexSignature;
