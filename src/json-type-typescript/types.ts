export interface TsModuleBlock {
  __node: 'ModuleBlock';
  statements: Array<TsInterfaceDeclaration>;
}

export interface TsInterfaceDeclaration {
  __node: 'InterfaceDeclaration';
  name: string;
  members: [];
}

export interface TsPropertySignature {
  __node: 'PropertySignature';
  name: string;
  optional?: boolean;
  type: TsType;
}

export interface TsQuestionToken {
  __node: 'QuestionToken',
}

export type TsType = 'string' | 'number' | 'boolean' | 'null';
