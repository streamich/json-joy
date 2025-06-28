/**
 * The `json-crdt-patch` sub-library implements JSON CRDT Patch specification, which
 * is a way to describe patches (changes) to JSON CRDT documents.
 *
 * This sub-library contains contains:
 *
 * - Classes for all JSON CRDT Patch operations.
 * - {@link Patch} class, which represents a JSON CRDT Patch.
 * - {@link PatchBuilder} class, which is used to build a JSON CRDT Patch.
 * - {@link json-crdt-patch/clock} module implements the logical clock.
 * - {@link json-crdt-patch/codec/verbose} module implements "verbose" serialization codec.
 * - {@link json-crdt-patch/codec/compact} module implements "compact" serialization codec.
 * - {@link json-crdt-patch/codec/binary} module implements "binary" serialization codec.
 *
 *
 * ## Usage
 *
 * The most common way to create a {@link Patch} is to use {@link PatchBuilder} class.
 *
 * ### Instantiating a {@link PatchBuilder}
 *
 * Create a new instance of {@link PatchBuilder} and use its methods to create
 * {@link Patch} operations.
 *
 * ```ts
 * import {PatchBuilder, LogicalClock} from 'json-joy/lib/json-crdt-patch';
 *
 * // The clock specifies the patch ID, i.e. the ID of the first operation
 * // in the patch. The clock is used to generate unique IDs for all operations
 * // in the patch.
 * const clock = new LogicalClock(123, 456);
 * const builder = new PatchBuilder(clock);
 * ```
 *
 * ### Creating a Patch
 *
 * You can use {@link PatchBuilder} methods which generate JSON CRDT Patch methods
 * directly, such as {@link PatchBuilder.str} or {@link PatchBuilder.insStr}, which
 * create a new "str" RGA-String data types and inset a string into it, respectively.
 *
 * ```ts
 * const strId = builder.str();
 * builder.insStr(strId, strId, 'Hello, world!');
 * ```
 *
 * You can use the {@link PatchBuilder.root} helper method to assign a value to the
 * JSON document root LWW-Register.
 *
 * ```ts
 * builder.root(strId);
 * ```
 *
 * Now you can retrieve the {@link Patch} instance by calling {@link PatchBuilder.flush}.
 *
 * ```ts
 * const patch = builder.flush();
 * ```
 *
 * A patch can be printed to terminal in a human-readable format using its
 * built-in {@link Patch.toString} method.
 *
 * ```ts
 * console.log(patch.toString());
 * // Patch 123.456!15
 * // ├─ "str" 123.456
 * // ├─ "ins_str" 123.457!13, obj = 123.456 { 123.456 ← "Hello, world!" }
 * // └─ "ins_val" 123.470!1, obj = 0.0, val = 123.456
 * ```
 *
 * One can also use various JSON helper methods like {@link PatchBuilder.json}
 * which recursively create the necessary operations to create a JSON document.
 *
 * ```ts
 * builder.root(builder.json({
 *   foo: 'bar',
 *   baz: 123,
 * }));
 *
 * const patch = builder.flush();
 * console.log(patch.toString());
 * // Patch 123.456!8
 * // ├─ "obj" 123.456
 * // ├─ "str" 123.457
 * // ├─ "ins_str" 123.458!3, obj = 123.457 { 123.457 ← "bar" }
 * // ├─ "con" 123.461 { 123 }
 * // ├─ "ins_obj" 123.462!1, obj = 123.456
 * // │   ├─ "foo": 123.457
 * // │   └─ "baz": 123.461
 * // └─ "ins_val" 123.463!1, obj = 0.0, val = 123.456
 * ```
 *
 * ### Serializing and Deserializing a Patch
 *
 * {@link Patch} can be serialized into a "binary" format using the build-in
 * {@link Patch.toBinary} method, and then deserialized back using the
 * {@link Patch.fromBinary} method.
 *
 * ```ts
 * const buf = patch.toBinary();
 * const patch2 = Patch.fromBinary(buf);
 * ```
 *
 * Also, "verbose" and "compact" serialization formats are supported. See the
 * following modules:
 *
 * - {@link json-crdt-patch/codec/verbose} module implements "verbose" serialization codec.
 * - {@link json-crdt-patch/codec/compact} module implements "compact" serialization codec.
 * - {@link json-crdt-patch/codec/binary} module implements "binary" serialization codec.
 *
 * @module
 */

export * from './types';
export * from './clock';
export * from './operations';
export * from './Patch';
export * from './PatchBuilder';
export * from './builder/schema';
export * from './builder/Konst';
export * from './builder/DelayedValueBuilder';
