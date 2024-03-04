export class BsonObjectId {
  public constructor(
    public timestamp: number,
    public process: number,
    public counter: number,
  ) {}
}

export class BsonDbPointer {
  public constructor(
    public name: string,
    public id: BsonObjectId,
  ) {}
}

export class BsonJavascriptCode {
  public constructor(public code: string) {}
}

export class BsonSymbol {
  public constructor(public symbol: string) {}
}

export class BsonJavascriptCodeWithScope {
  public constructor(
    public code: string,
    public scope: Record<string, unknown>,
  ) {}
}

export class BsonInt32 {
  public constructor(public value: number) {}
}

export class BsonInt64 {
  public constructor(public value: number) {}
}

export class BsonFloat {
  public constructor(public value: number) {}
}

export class BsonTimestamp {
  public constructor(
    public increment: number,
    public timestamp: number,
  ) {}
}

export class BsonDecimal128 {
  public constructor(public data: Uint8Array) {}
}

export class BsonMinKey {}

export class BsonMaxKey {}

export class BsonBinary {
  public constructor(
    public subtype: number,
    public data: Uint8Array,
  ) {}
}
