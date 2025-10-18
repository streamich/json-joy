/**
 * XDR (External Data Representation Standard) module
 *
 * Fully compliant with:
 * - RFC 4506 (May 2006) - Current standard with IANA and security considerations
 * - RFC 1832 (August 1995) - Enhanced standard with quadruple floats and optional-data
 * - RFC 1014 (June 1987) - Original standard
 *
 * Features:
 * - All XDR data types (int, hyper, float, double, string, opaque, arrays, structs, unions, optional-data)
 * - Big-endian byte order with 4-byte alignment
 * - Schema-based encoding/decoding with validation
 * - TypeScript definitions
 */

export * from './types';
export * from './XdrEncoder';
export * from './XdrDecoder';
export * from './XdrSchemaEncoder';
export * from './XdrSchemaDecoder';
export * from './XdrSchemaValidator';
export * from './XdrUnion';
