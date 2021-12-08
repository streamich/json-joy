/** A module declaration, e.g. "namespace Foo {". */
export interface TsModuleDeclaration {
  node: 'ModuleDeclaration';
  name: string;
  statements: TsDeclaration[];
  comment?: string;
}

/** An interface declaration, e.g. "interface Bar {". */
export interface TsInterfaceDeclaration {
  node: 'InterfaceDeclaration';
  name: string;
  members: TsPropertySignature[];
  comment?: string;
}

/** A property of an interface type. */
export interface TsPropertySignature {
  node: 'PropertySignature';
  name: string;
  optional?: boolean;
  type: TsType;
}

/** A type alias declaration, e.g. "type Baz = ...". */
export interface TsTypeAliasDeclaration {
  node: 'TypeAliasDeclaration';
  name: string;
  type: TsType;
}

/** All possible declarations that can be statements of a module. */
export type TsDeclaration = TsModuleDeclaration | TsInterfaceDeclaration | TsTypeAliasDeclaration;

/** An "Array<*>" type. */
export interface TsArrayType {
  node: 'ArrayType';
  elementType: TsType;
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

/** "unknown" */
export interface TsUnknownKeyword {
  node: 'UnknownKeyword';
}

/** Inline interface type. */
export interface TsTypeLiteral {
  node: 'TypeLiteral';
  members: TsPropertySignature[];
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

/** A reference to a type alias, e.g. "foo: Reference". */
export interface TsTypeReference {
  node: 'TypeReference';
  typeName: string;
}

/** All type annotations. */
export type TsType =
  | TsArrayType
  | TsStringKeyword
  | TsNumberKeyword
  | TsBooleanKeyword
  | TsNullKeyword
  | TsAnyKeyword
  | TsTypeLiteral
  | TsStringLiteral
  | TsNumericLiteral
  | TsTrueKeyword
  | TsFalseKeyword
  | TsUnknownKeyword
  | TsUnionType
  | TsTypeReference;

/** Any possible TypeScript AST node. */
export type TsNode = TsDeclaration | TsPropertySignature | TsType;
