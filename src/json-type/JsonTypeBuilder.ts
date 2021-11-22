import {TNull, TBoolean, TNumber, TString, TArray, TObject, TObjectField, NoT, TBinary, TType, TAny, TRef} from "./types/json";

export class JsonTypeBuilder {
  get str() {
    return this.String();
  }

  get num() {
    return this.Number();
  }

  get bool() {
    return this.Boolean();
  }

  get nil() {
    return this.Null();
  }

  get arr() {
    return this.Array([]);
  }

  get obj() {
    return this.Object({
      fields: [],
    });
  }

  get bin() {
    return this.Binary();
  }

  get any() {
    return this.Any();
  }

  public Null(options: NoT<TNull> = {}): TNull {
    return {
      __t: 'nil',
      ...options,
    };
  }

  public Boolean(options: NoT<TBoolean> = {}): TBoolean {
    return {
      __t: 'bool',
      ...options,
    };
  }

  public Number(options: NoT<TNumber> = {}): TNumber {
    return {
      __t: 'num',
      ...options,
    };
  }

  public String(options: NoT<TString> = {}): TString {
    return {
      __t: 'str',
      ...options,
    };
  }

  public Array(type: TType | TType[], options: Omit<NoT<TArray>, 'type'> = {}): TArray {
    return {
      __t: 'arr',
      type,
      ...options,
    };
  }

  public Object(options: NoT<TObject>): TObject {
    return {
      __t: 'obj',
      ...options,
    };
  }

  public Field(key: string, type: TType | TType[], options: Omit<TObjectField, 'key' | 'type'> = {}): TObjectField {
    return {
      key,
      type,
      ...options,
    };
  }

  public Binary(options: NoT<TBinary> = {}): TBinary {
    return {
      __t: 'bin',
      ...options,
    };
  }

  public Any(options: NoT<TAny> = {}): TAny {
    return {
      __t: 'any',
      ...options,
    };
  }

  public Ref(ref: string): TRef {
    return {
      __t: 'ref',
      ref,
    };
  }
};
