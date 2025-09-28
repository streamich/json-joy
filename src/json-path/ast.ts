import type * as types from './types';

export class Ast {
  public static selector = class selector {
    public static named = (name: string): types.NamedSelector => new Named(name);
  }
}

class Named implements types.NamedSelector {
  public type: 'name' = 'name';
  constructor(
    public name: string,
  ) {}
}
