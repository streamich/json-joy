import {TNull, TBoolean, TNumber, TString, TArray, TObject, TObjectField, NoT, TBinary, TType} from "./types/json";

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

  get bin() {
    return this.Binary();
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

  Array: (type: TType | TType[], options: Omit<NoT<TArray>, 'type'> = {}): TArray => {
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

  Field: (key: string, type: TType | TType[], options: Omit<TObjectField, 'key' | 'type'> = {}): TObjectField => {
    return {
      key,
      type,
      ...options,
    };
  },

  Binary: (options: NoT<TBinary> = {}): TBinary => {
    return {
      __t: 'bin',
      ...options,
    };
  },
};
