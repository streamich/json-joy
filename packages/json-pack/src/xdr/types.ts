import type {XdrDecoder} from './XdrDecoder';
import type {XdrEncoder} from './XdrEncoder';

/**
 * XDR (External Data Representation Standard) schema type definitions
 * based on RFC 4506 (May 2006), which obsoletes RFC 1832 (August 1995)
 * and RFC 1014 (June 1987).
 *
 * This implementation supports all three RFC versions:
 * - RFC 1014: Original XDR standard
 * - RFC 1832: Added quadruple-precision floats, enhanced optional-data
 * - RFC 4506: Added IANA considerations and security guidance (no protocol changes)
 *
 * Specification: https://datatracker.ietf.org/doc/html/rfc4506
 */
export type XdrSchema = XdrPrimitiveSchema | XdrWidePrimitiveSchema | XdrCompositeSchema | XdrOptionalSchema;

// Primitive type schemas

export type XdrPrimitiveSchema =
  | XdrVoidSchema
  | XdrIntSchema
  | XdrUnsignedIntSchema
  | XdrEnumSchema
  | XdrBooleanSchema
  | XdrHyperSchema
  | XdrUnsignedHyperSchema
  | XdrFloatSchema
  | XdrDoubleSchema
  | XdrQuadrupleSchema;

export type XdrVoidSchema = XdrBaseSchema<'void'>;
export type XdrIntSchema = XdrBaseSchema<'int'>;
export type XdrUnsignedIntSchema = XdrBaseSchema<'unsigned_int'>;
export interface XdrEnumSchema extends XdrBaseSchema<'enum'> {
  values: Record<string, number>;
}
export type XdrBooleanSchema = XdrBaseSchema<'boolean'>;
export type XdrHyperSchema = XdrBaseSchema<'hyper'>;
export type XdrUnsignedHyperSchema = XdrBaseSchema<'unsigned_hyper'>;
export type XdrFloatSchema = XdrBaseSchema<'float'>;
export type XdrDoubleSchema = XdrBaseSchema<'double'>;
export type XdrQuadrupleSchema = XdrBaseSchema<'quadruple'>;

// Wide primitive type schemas

export type XdrWidePrimitiveSchema = XdrOpaqueSchema | XdrVarlenOpaqueSchema | XdrStringSchema;

export interface XdrOpaqueSchema extends XdrBaseSchema<'opaque'> {
  size: number;
}

export interface XdrVarlenOpaqueSchema extends XdrBaseSchema<'vopaque'> {
  size?: number;
}

export interface XdrStringSchema extends XdrBaseSchema<'string'> {
  size?: number;
}

// Composite type schemas

export type XdrCompositeSchema =
  | XdrArraySchema
  | XdrVarlenArraySchema
  | XdrStructSchema
  | XdrUnionSchema
  | XdrOptionalSchema
  | XdrConstantSchema;

export interface XdrArraySchema extends XdrBaseSchema<'array'> {
  /** Schema of array elements */
  elements: XdrSchema;
  /** Fixed number of elements */
  size: number;
}

export interface XdrVarlenArraySchema extends XdrBaseSchema<'varray'> {
  /** Schema of array elements */
  elements: XdrSchema;
  /** Optional maximum length constraint */
  size?: number;
}

/**
 * The components of the structure are encoded in the order of their
 * declaration in the structure.  Each component's size is a multiple of
 * four bytes, though the components may be different sizes.
 */
export interface XdrStructSchema extends XdrBaseSchema<'struct'> {
  /** Array of field definitions */
  fields: [schema: XdrSchema, name: string][];
}

/**
 * A discriminated union is a type composed of a discriminant followed
 * by a type selected from a set of prearranged types according to the
 * value of the discriminant.  The type of discriminant is either "int",
 * "unsigned int", or an enumerated type, such as "bool".  The component
 * types are called "arms" of the union and are preceded by the value of
 * the discriminant that implies their encoding.
 */
export interface XdrUnionSchema extends XdrBaseSchema<'union'> {
  type: 'union';
  arms: [discriminant: number | string | boolean, schema: XdrSchema][];
  default?: XdrSchema;
}

/**
 * Optional-data is a special case introduced in RFC 1832.
 * It is syntactic sugar for a union with a boolean discriminant:
 *   type *identifier;
 * is equivalent to:
 *   union switch (bool opted) {
 *     case TRUE: type element;
 *     case FALSE: void;
 *   }
 */
export interface XdrOptionalSchema extends XdrBaseSchema<'optional'> {
  /** Schema of the optional element */
  element: XdrSchema;
}

/**
 * Constant definition (RFC 4506 Section 4.17).
 * Constants are used to define symbolic names for numeric values.
 */
export interface XdrConstantSchema extends XdrBaseSchema<'const'> {
  value: number;
}

// Base schema

export interface XdrBaseSchema<Type extends string> {
  /** The schema type */
  type: Type;
}

export type XdrTypeDecoder<T extends XdrType> = (xdr: XdrDecoder) => T;

export interface XdrType {
  encode(xdr: XdrEncoder): void;
}
