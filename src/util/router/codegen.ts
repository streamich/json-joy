import {Codegen} from '@jsonjoy.com/util/lib/codegen';
import {JsExpression} from '@jsonjoy.com/util/lib/codegen/util/JsExpression';
import type {Match} from './router';

export type RouteMatcher<Data = unknown> = (route: string) => undefined | Match<Data>;

export class RouterCodegenCtx {
  public readonly codegen: Codegen<RouteMatcher>;

  constructor() {
    this.codegen = new Codegen<RouteMatcher>({
      args: ['str'],
      prologue: 'str = "" + str; var len = str.length|0;',
      epilogue: 'return undefined;',
    });
  }
}

export class RouterCodegenOpts {
  constructor(
    public readonly slice: JsExpression,
    public readonly offset: string,
    public readonly depth: number = 0,
  ) {}

  public create(offset: string): RouterCodegenOpts {
    const slice = new JsExpression(() => `str.slice(${offset})`);
    return new RouterCodegenOpts(slice, offset, this.depth + 1);
  }
}
