import type * as verbose from '../schema/schema';
import type * as compact from './schema';

// prettier-ignore
export type VerboseToCompact<T extends verbose.TType> = T extends verbose.AnySchema
  ? compact.AnyCompactSchema
  : T extends verbose.BooleanSchema
    ? compact.BooleanCompactSchema
    : T extends verbose.NumberSchema
      ? compact.NumberCompactSchema
      : T extends verbose.StringSchema
        ? compact.StringCompactSchema
        : T extends verbose.BinarySchema<infer V>
          ? compact.BinaryCompactSchema<VerboseToCompact<V>>
          : T extends verbose.ArraySchema<infer V>
            ? compact.ArrayCompactSchema<VerboseToCompact<V>>
            : T extends verbose.ConstSchema<infer V>
              ? compact.ConstCompactSchema<V>
              : T extends verbose.TupleSchema<infer V>
                ? compact.TupleCompactSchema<{[K in keyof V]: VerboseToCompact<V[K]>}>
                : T extends verbose.ObjectSchema<infer F>
                  ? compact.ObjectCompactSchema<{[K in keyof F]: VerboseToCompactFields<F[K]>}>
                  : T extends verbose.ObjectFieldSchema<infer K, infer V>
                    ? compact.ObjectFieldCompactSchema<K, VerboseToCompact<V>>
                    : T extends verbose.ObjectOptionalFieldSchema<infer K, infer V>
                      ? compact.ObjectOptionalFieldCompactSchema<K, VerboseToCompact<V>>
                      : never;

type VerboseToCompactFields<T extends verbose.ObjectFieldSchema<any, any>> = T extends verbose.ObjectOptionalFieldSchema<infer K, infer V>
  ? compact.ObjectOptionalFieldCompactSchema<K, VerboseToCompact<V>>
  : T extends verbose.ObjectFieldSchema<infer K, infer V>
    ? compact.ObjectFieldCompactSchema<K, VerboseToCompact<V>>
    : never;
