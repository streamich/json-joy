import {JsonPackExtension} from '../JsonPackExtension';

export class RespPush extends JsonPackExtension<unknown[]> {
  constructor(public readonly val: unknown[]) {
    super(1, val);
  }
}

export class RespAttributes extends JsonPackExtension<Record<string, unknown>> {
  constructor(public readonly val: Record<string, unknown>) {
    super(2, val);
  }
}

export class RespVerbatimString extends JsonPackExtension<string> {
  constructor(public readonly val: string) {
    super(3, val);
  }
}
