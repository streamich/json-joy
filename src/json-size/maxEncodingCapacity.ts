export const enum MaxEncodingOverhead {
  Null = 4, // Literal "null"
  Boolean = 5, // Literal "false"
  Number = 22, // Literal "1.1111111111111111e+21" = JSON.stringify(1111111111111111111112)
  String = 1 + 4, // As per TLV: 1 byte for type, 4 bytes for length.
  StringLengthMultiplier = 5, // 4x UTF-8 overhead + 1.3x Base64 overhead, plus, 1 byte for each non-ASCII character.
  Binary = 2 + 37 + 2, // 2 for two quotes, 37 for "data:application/octet-stream;base64,'" literal, 2 bytes for Base64 padding.
  BinaryLengthMultiplier = 2, // 1.3x Base64 overhead.
  Array = 1 + 4, // As per TLV: 1 byte for type, 4 bytes for length.
  ArrayElement = 1, // Separator "," literal.
  Object = 1 + 4, // As per TLV: 1 byte for type, 4 bytes for length.
  ObjectElement = 1 + 1, // 1 byte for Key-value separator ":" literal, and 1 byte for separator "," literal.
  Undefined = Binary + BinaryLengthMultiplier * 2,
}

export const maxEncodingCapacity = (value: unknown): number => {
  switch (typeof value) {
    case 'number':
      return MaxEncodingOverhead.Number;
    case 'string':
      return MaxEncodingOverhead.String + value.length * MaxEncodingOverhead.StringLengthMultiplier;
    case 'boolean':
      return MaxEncodingOverhead.Boolean;
    case 'object': {
      if (!value) return MaxEncodingOverhead.Null;
      const constructor = value.constructor;
      switch (constructor) {
        case Array: {
          const arr = value as unknown[];
          const length = arr.length;
          let size = MaxEncodingOverhead.Array + length * MaxEncodingOverhead.ArrayElement;
          for (let i = arr.length - 1; i >= 0; i--) size += maxEncodingCapacity(arr[i]);
          return size;
        }
        case Uint8Array: {
          return MaxEncodingOverhead.Binary + (value as Uint8Array).length * MaxEncodingOverhead.BinaryLengthMultiplier;
        }
        case Object: {
          let size = MaxEncodingOverhead.Object;
          const obj = value as Record<string, unknown>;
          for (const key in obj)
            if (obj.hasOwnProperty(key))
              size += MaxEncodingOverhead.ObjectElement + maxEncodingCapacity(key) + maxEncodingCapacity(obj[key]);
          return size;
        }
        default:
          return MaxEncodingOverhead.Undefined;
      }
    }
    case 'bigint':
      return MaxEncodingOverhead.Number;
    default:
      return MaxEncodingOverhead.Undefined;
  }
};
