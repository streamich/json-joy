import {
  TNull,
  TBoolean,
  TNumber,
  TString,
  TArray,
  TObject,
  TObjectField,
  NoT,
  TBinary,
  TType,
  TAny,
  TRef,
  TOr,
  TEnum,
} from './types/type';

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
    return this.Array(this.any);
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
    return {__t: 'bool', ...(a || {})};
  }

  public Number(id: string, options?: Omit<NoT<TNumber>, 'id'>): TNumber;
  public Number(options?: NoT<TNumber>): TNumber;
  public Number(a?: string | NoT<TNumber>, b?: NoT<TNumber>): TNumber {
    if (typeof a === 'string') return this.Number({id: a, ...(b || {})});
    return {__t: 'num', ...(a || {})};
  }

  public String(id: string, options?: NoT<TString>): TString;
  public String(options?: NoT<TString>): TString;
  public String(a?: string | NoT<TString>, b?: NoT<TString>): TString {
    if (typeof a === 'string') return this.String({id: a, ...(b || {})});
    return {__t: 'str', ...(a || {})};
  }

  public Array(id: string, type: TType, options?: Omit<NoT<TArray>, 'id' | 'type'>): TArray;
  public Array(type: TType, options?: Omit<NoT<TArray>, 'type'>): TArray;
  public Array(a: string | TType, b?: TType | Omit<NoT<TArray>, 'type'>, c?: Omit<NoT<TArray>, 'id' | 'type'>): TArray {
    if (typeof a === 'string') return this.Array(b as TType, {id: a, ...(c || {})});
    return {__t: 'arr', ...(b as Omit<NoT<TArray>, 'id' | 'type'>), type: a};
  }

  public Object(id: string, options: Omit<NoT<TObject>, 'id'>): TObject;
  public Object(fields: TObject['fields'], options?: Omit<NoT<TObject>, 'fields'>): TObject;
  public Object(id: string, fields: TObject['fields'], options?: Omit<NoT<TObject>, 'id' | 'fields'>): TObject;
  public Object(options: NoT<TObject>): TObject;
  public Object(
    a: string | TObject['fields'] | NoT<TObject>,
    b?: Omit<NoT<TObject>, 'id'> | Omit<NoT<TObject>, 'fields'> | TObject['fields'],
    c?: Omit<NoT<TObject>, 'id' | 'fields'>,
  ): TObject {
    if (typeof a === 'string') {
      if (Array.isArray(b)) return this.Object({id: a, fields: b, ...(c || {})});
      return this.Object({id: a, ...((b as Omit<NoT<TObject>, 'id'>) || {})});
    } else if (Array.isArray(a)) {
      return this.Object({fields: a, ...(b || {})});
    }
    return {__t: 'obj', ...(a || {})};
  }

  public Field(key: string, type: TType, options: Omit<TObjectField, 'key' | 'type'> = {}): TObjectField {
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

  public Or(types: TType[]): TOr;
  public Or(...types: TType[]): TOr;
  public Or(...a: unknown[]): TOr {
    return {
      __t: 'or',
      types: a[0] instanceof Array ? a[0] : a,
    };
  }

  public Enum(options: NoT<TEnum>): TEnum;
  public Enum(values: unknown[], options?: Omit<NoT<TEnum>, 'values'>): TEnum;
  public Enum(a: unknown[] | NoT<TEnum>, b?: Omit<NoT<TEnum>, 'values'>): TEnum {
    if (Array.isArray(a)) {
      if (!a.length) throw new Error('Enum must have at least one value.');
      return this.Enum({...b, values: a});
    }
    return {
      __t: 'enum',
      ...a,
    };
  }
}
