export interface TsModuleDeclaration {
  node: 'ModuleDeclaration';
  name: string;
  statements: TsDeclaration[];
  comment?: string;
}

export interface TsInterfaceDeclaration {
  node: 'InterfaceDeclaration';
  name: string;
  members: TsPropertySignature[];
  comment?: string;
}

export interface TsPropertySignature {
  node: 'PropertySignature';
  name: string;
  optional?: boolean;
  type: TsType;
}

export interface TsTypeAliasDeclaration {
  node: 'TypeAliasDeclaration';
  name: string;
  type: TsType;
}

export type TsDeclaration =
  | TsModuleDeclaration
  | TsInterfaceDeclaration
  | TsTypeAliasDeclaration;

export interface TsArrayType {
  node: 'ArrayType';
  elementType: TsType;
}

export interface TsStringKeyword {
  node: 'StringKeyword';
}

export interface TsNumberKeyword {
  node: 'NumberKeyword';
}

export interface TsBooleanKeyword {
  node: 'BooleanKeyword';
}

export interface TsNullKeyword {
  node: 'NullKeyword';
}

export interface TsAnyKeyword {
  node: 'AnyKeyword';
}

export interface TsStringLiteral {
  node: 'StringLiteral';
  text: string;
}

export interface TsNumericLiteral {
  node: 'NumericLiteral';
  text: string;
}

export interface TsUnionType {
  node: 'UnionType';
  types: TsType[];
}

export interface TsTypeReference {
  node: 'TypeReference';
  typeName: string;
}

export type TsType =
  | TsStringKeyword
  | TsNumberKeyword
  | TsBooleanKeyword
  | TsNullKeyword
  | TsAnyKeyword
  | TsStringLiteral
  | TsNumericLiteral
  | TsUnionType
  | TsTypeReference;

export type TsNode = TsDeclaration | TsType;

// export interface TsTypeLiteral {
//   node: 'TypeLiteral';
//   members: TsPropertySignature[];
// }
