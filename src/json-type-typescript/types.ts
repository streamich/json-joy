export interface TsModuleDeclaration {
  node: 'ModuleDeclaration';
  name: string;
  statements: Array<TsModuleDeclaration | TsInterfaceDeclaration>;
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

export interface TsStringLiteral {
  node: 'StringLiteral';
  text: string;
}

export interface TsNumericLiteral {
  node: 'NumericLiteral';
  text: string;
}

export interface TsUnionType {
  types: TsType[];
}

export type TsType =
  | TsStringKeyword
  | TsNumberKeyword
  | TsBooleanKeyword
  | TsNullKeyword
  | TsStringLiteral
  | TsNumericLiteral
  | TsUnionType;

export interface TsTypeLiteral {
  node: 'TypeLiteral';
  members: TsPropertySignature[];
}
