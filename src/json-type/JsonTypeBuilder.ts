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

  public Boolean(id: string, options?: Omit<NoT<TBoolean>, 'id'>): TBoolean;
  public Boolean(options?: NoT<TBoolean>): TBoolean;
  public Boolean(a?: string | NoT<TBoolean>, b?: NoT<TBoolean> | void): TBoolean {
    if (typeof a === 'string') return this.Boolean({id: a, ...(b || {})});
    return {__t: 'bool', ...a};
  }

  public Number(id: string, options?: Omit<NoT<TNumber>, 'id'>): TNumber;
  public Number(options?: NoT<TNumber>): TNumber;
  public Number(a?: string | NoT<TNumber>, b?: NoT<TNumber>): TNumber {
    if (typeof a === 'string') return this.Number({id: a, ...(b || {})});
    return {__t: 'num', ...a};
  }

  public String(id: string, options?: NoT<TString>): TString;
  public String(options?: NoT<TString>): TString;
  public String(a?: string | NoT<TString>, b?: NoT<TString>): TString {
    if (typeof a === 'string') return this.String({id: a, ...(b || {})});
    return {__t: 'str', ...a};
  }

  public Array(id: string, type: TType | TType[], options?: Omit<NoT<TArray>, 'id' | 'type'>): TArray;
  public Array(type: TType | TType[], options?: Omit<NoT<TArray>, 'type'>): TArray;
  public Array(a: string | TType | TType[], b?: TType | TType[] | Omit<NoT<TArray>, 'type'>, c?: Omit<NoT<TArray>, 'id' | 'type'>): TArray {
    if (typeof a === 'string') return this.Array(b as TType | TType[], {id: a, ...(c || {})});
    return {__t: 'arr', ...(b as Omit<NoT<TArray>, 'id' | 'type'>), type: a};
  }

  public Object(id: string, options: Omit<NoT<TObject>, 'id'>): TObject;
  public Object(options: NoT<TObject>): TObject;
  public Object(a: string | NoT<TObject>, b?: Omit<NoT<TObject>, 'id'>): TObject {
    if (typeof a === 'string') return this.Object({id: a, ...(b || {} as Omit<NoT<TObject>, 'id'>)});
    return {__t: 'obj', ...a};
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
