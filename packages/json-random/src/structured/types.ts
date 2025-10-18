import type {Token} from '../string';

/**
 * Schema (template) for random JSON generation.
 */
export type Template = TemplateShorthand | TemplateNode | TemplateRecursiveReference;

export type TemplateNode =
  | LiteralTemplate
  | NumberTemplate
  | IntegerTemplate
  | Int64Template
  | FloatTemplate
  | StringTemplate
  | BooleanTemplate
  | BinTemplate
  | NullTemplate
  | ArrayTemplate
  | ObjectTemplate
  | MapTemplate
  | OrTemplate;

export type TemplateShorthand =
  | 'num'
  | 'int'
  | 'int64'
  | 'float'
  | 'str'
  | 'bool'
  | 'bin'
  | 'nil'
  | 'arr'
  | 'obj'
  | 'map';

/**
 * Recursive reference allows for recursive template construction, for example:
 *
 * ```ts
 * const user = (): Template => ['obj', [
 *   ['id', ['str', ['repeat', 4, 8, ['pick', ...'0123456789'.split('')]]]],
 *   ['friend', user, .2] // <--- Probability 20%
 * ]];
 * ```
 *
 * The above corresponds to:
 *
 * ```ts
 * interface User {
 *   id: string;
 *   friend?: User; // <--- Recursive
 * }
 * ```
 */
export type TemplateRecursiveReference = () => Template;

/**
 * Literal value template. The literal value is deeply cloned when generating
 * the random JSON and inserted as-is.
 */
export type LiteralTemplate = ['lit', value: unknown];

/**
 * Number template. Generates a random number within the specified range. Can be
 * a floating-point number or an integer.
 */
export type NumberTemplate = [type: 'num', min?: number, max?: number];

/**
 * Integer template. Generates a random integer within the specified range.
 * If no range is specified, it defaults to the full range of JavaScript integers.
 */
export type IntegerTemplate = [type: 'int', min?: number, max?: number];

/**
 * 64-bit integer template. Generates a random bigint within the specified range.
 * If no range is specified, it defaults to a reasonable range for 64-bit integers.
 */
export type Int64Template = [type: 'int64', min?: bigint, max?: bigint];

/**
 * Float template. Generates a random floating-point number within the specified
 * range. If no range is specified, it defaults to the full range of JavaScript
 * floating-point numbers.
 */
export type FloatTemplate = [type: 'float', min?: number, max?: number];

/**
 * String template. Generates a random string based on the
 * provided {@link Token} schema. If no token is specified, it defaults to a
 * simple string generation.
 */
export type StringTemplate = [type: 'str', token?: Token];

/**
 * Boolean template. Generates a random boolean value. If a specific value is
 * provided, it will always return that value; otherwise, it randomly returns
 * `true` or `false`.
 */
export type BooleanTemplate = [type: 'bool', value?: boolean];

/**
 * Binary template. Generates a random Uint8Array. The template allows
 * specifying the length of binary data and the range of values in each octet.
 */
export type BinTemplate = [
  type: 'bin',
  /**
   * The minimum length of binary data. Defaults to 0.
   */
  min?: number,
  /**
   * The maximum length of binary data. Defaults to 5.
   */
  max?: number,
  /**
   * The minimum octet value. Defaults to 0.
   */
  omin?: number,
  /**
   * The maximum octet value. Defaults to 255.
   */
  omax?: number,
];

/**
 * Null template. Generates a `null` value. If a specific value is provided, it
 * will always return that value; otherwise, it returns `null`.
 */
export type NullTemplate = [type: 'nil'];

/**
 * Array template. Generates a random array. If no template is specified, it
 * uses the default template. If a template is provided, it generates an array
 * of random values based on that template.
 */
export type ArrayTemplate = [
  type: 'arr',
  /**
   * The minimum number of elements in the array.
   */
  min?: number,
  /**
   * The maximum number of elements in the array.
   */
  max?: number,
  /**
   * The template to use for generating the array elements.
   */
  template?: Template,
  /**
   * The templates to use for generating the *head* array elements. The head
   * is the "tuple" part of the array that is generated before the main template.
   */
  head?: Template[],
  /**
   * The templates to use for generating the *tail* array elements. The tail
   * is the "rest" part of the array that is generated after the main template.
   */
  tail?: Template[],
];

/**
 * Object template. Generates a random object. If no fields are specified, it
 * uses the default template. If fields are provided, it generates an object
 * with those fields, where each field can be optional or required.
 */
export type ObjectTemplate = [
  type: 'obj',
  /**
   * Fields of the object. Once can specify key and value templates for each
   * field. The key can be a string or a token, and the value can be any
   * valid JSON template. Fields can also be optional. Fields are generated
   * in a random order.
   */
  fields?: ObjectTemplateField[],
];

/**
 * Specifies a field in an object template.
 */
export type ObjectTemplateField = [
  /**
   * The key of the field. Can be a string or a {@link Token} to generate a
   * random key. If `null`, the default key {@link Token} will be used.
   */
  key: Token | null,
  /**
   * The template for the value of the field. If not specified, the default
   * template will be used.
   */
  value?: Template,
  /**
   * Whether the field is optional. This number specifies a probability from 0
   * to 1 that the field will be included in the generated object. A value of
   * 0 means the field is required, and a value of 1 means the field is omitted
   * with a probability of 1. If not specified, the field is required (0
   * probability of omission).
   */
  optionality?: number,
];

/**
 * Generates a random map-like (record) structure, where every value has the
 * same template.
 */
export type MapTemplate = [
  type: 'map',
  /**
   * Token to use for generating the keys of the map. If `null` or not set,
   * the default key {@link Token} will be used.
   */
  key?: Token | null,
  /**
   * The template for the value of the map. If not specified, the default
   * template will be used.
   */
  value?: Template,
  /**
   * The minimum number of entries in the map. Defaults to 0.
   */
  min?: number,
  /**
   * The maximum number of entries in the map. Defaults to 5.
   */
  max?: number,
];

/**
 * Union type for templates that can be used in a random JSON generation.
 * This allows for flexible combinations of different template types. The "or"
 * operator picks one of the provided templates at random.
 */
export type OrTemplate = ['or', ...Template[]];
