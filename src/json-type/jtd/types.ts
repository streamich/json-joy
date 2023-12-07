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
  | 'string'
  | 'timestamp'
  | 'float32'
  | 'float64'
  | 'int8'
  | 'int16'
  | 'int32'
  | 'uint32';

export interface JtdEnumForm extends JtdFormBase {
  enum: string[];
}

export interface JtdElementsForm extends JtdFormBase {
  elements: JtdForm[];
}

export interface JtdPropertiesForm extends JtdFormBase {
  properties?: Record<string, JtdForm>;
  optionalProperties?: Record<string, JtdForm>;
}

export interface JtdValuesForm extends JtdFormBase {
  values: JtdForm;
}

export interface JtdDiscriminatorForm extends JtdFormBase {
  discriminator: string;
  mapping: Record<string, JtdForm>;
}
