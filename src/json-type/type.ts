import {TNull, TBoolean, TNumber, TString, TArray, TObject, TObjectField, TJson, NoT} from "./types/json";

export const t = {
  get str() {
    return this.String();
  },

  get num() {
    return this.Number();
  },

  get bool() {
    return this.Boolean();
  },

  get nil() {
    return this.Null();
  },

  get arr() {
    return this.Array([]);
  },

  get obj() {
    return this.Object({
      fields: [],
    });
  },

  Null: (options: NoT<TNull> = {}): TNull => {
    return {
      __t: 'nil',
      ...options,
    };
  },

  Boolean: (options: NoT<TBoolean> = {}): TBoolean => {
    return {
      __t: 'bool',
      ...options,
    };
  },

  Number: (options: NoT<TNumber> = {}): TNumber => {
    return {
      __t: 'num',
      ...options,
    };
  },

  String: (options: NoT<TString> = {}): TString => {
    return {
      __t: 'str',
      ...options,
    };
  },

  Array: (type: TJson | TJson[], options: Omit<NoT<TArray>, 'type'> = {}): TArray => {
    return {
      __t: 'arr',
      type,
      ...options,
    };
  },

  Object: (options: NoT<TObject>): TObject => {
    return {
      __t: 'obj',
      ...options,
    };
  },

  Field: (key: string, type: TJson | TJson[], options: Omit<TObjectField, 'key' | 'type'> = {}): TObjectField => {
    return {
      key,
      type,
      ...options,
    };
  },
};
