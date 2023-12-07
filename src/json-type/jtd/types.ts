// prettier-ignore
export type JtdForm =
  | JtdEmptyForm
  | JtdRefForm
  | JtdTypeForm
  | JtdEnumForm
  | JtdElementsForm
  | JtdPropertiesForm
  | JtdValuesForm
  | JtdDiscriminatorForm
  ;

export interface JtdFormBase {
  metadata?: Record<string, unknown>;
}

export interface JtdEmptyForm extends JtdFormBase {
  nullable?: boolean;
}

export interface JtdRefForm extends JtdFormBase {
  ref: string;
}

export interface JtdTypeForm extends JtdFormBase {
  type: JtdType;
}

// prettier-ignore
export type JtdType =
  | 'boolean'
  | 'float32'
  | 'float64'
  | 'int8'
  | 'uint8'
  | 'int16'
  | 'uint16'
  | 'int32'
  | 'uint32'
  | 'string'
  | 'timestamp'
  ;

export interface JtdEnumForm extends JtdFormBase {
  enum: string[];
}

export interface JtdElementsForm extends JtdFormBase {
  elements: JtdForm[];
}

export interface JtdPropertiesForm extends JtdFormBase {
  properties?: Record<string, JtdForm>;
  optionalProperties?: Record<string, JtdForm>;
  additionalProperties?: boolean;
}

export interface JtdValuesForm extends JtdFormBase {
  values: JtdForm;
}

export interface JtdDiscriminatorForm extends JtdFormBase {
  discriminator: string;
  mapping: Record<string, JtdForm>;
}

export interface JtdError {
  instancePath: string;
  schemaPath: string;
}
