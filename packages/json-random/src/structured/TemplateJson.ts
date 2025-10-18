import {int, int64} from '../number';
import {randomString} from '../string';
import {clone} from '../util';
import * as templates from './templates';
import type {
  ArrayTemplate,
  BinTemplate,
  BooleanTemplate,
  FloatTemplate,
  IntegerTemplate,
  Int64Template,
  LiteralTemplate,
  MapTemplate,
  NumberTemplate,
  ObjectTemplate,
  OrTemplate,
  StringTemplate,
  Template,
  TemplateNode,
} from './types';

export interface TemplateJsonOpts {
  /**
   * Sets the limit of maximum number of JSON nodes to generate. This is a soft
   * limit: once this limit is reached, no further optional values are generate
   * (optional object and map keys are not generated, arrays are generated with
   * their minimum required size).
   */
  maxNodes?: number;
}

export class TemplateJson {
  public static readonly gen = (template?: Template, opts?: TemplateJsonOpts): unknown => {
    const generator = new TemplateJson(template, opts);
    return generator.gen();
  };

  protected nodes: number = 0;
  protected maxNodes: number;

  constructor(
    public readonly template: Template = templates.nil,
    public readonly opts: TemplateJsonOpts = {},
  ) {
    this.maxNodes = opts.maxNodes ?? 100;
  }

  public gen(): unknown {
    return this.generate(this.template);
  }

  protected generate(tpl: Template): unknown {
    this.nodes++;
    while (typeof tpl === 'function') tpl = tpl();
    const template: TemplateNode = typeof tpl === 'string' ? [tpl] : tpl;
    const type = template[0];
    switch (type) {
      case 'arr':
        return this.generateArray(template as ArrayTemplate);
      case 'obj':
        return this.generateObject(template as ObjectTemplate);
      case 'map':
        return this.generateMap(template as MapTemplate);
      case 'str':
        return this.generateString(template as StringTemplate);
      case 'num':
        return this.generateNumber(template as NumberTemplate);
      case 'int':
        return this.generateInteger(template as IntegerTemplate);
      case 'int64':
        return this.generateInt64(template as Int64Template);
      case 'float':
        return this.generateFloat(template as FloatTemplate);
      case 'bool':
        return this.generateBoolean(template as BooleanTemplate);
      case 'bin':
        return this.generateBin(template as BinTemplate);
      case 'nil':
        return null;
      case 'lit':
        return this.generateLiteral(template as any);
      case 'or':
        return this.generateOr(template as any);
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  protected minmax(min: number, max: number): number {
    if (this.nodes > this.maxNodes) return min;
    if (this.nodes + max > this.maxNodes) max = this.maxNodes - this.nodes;
    if (max < min) max = min;
    return int(min, max);
  }

  protected generateArray(template: ArrayTemplate): unknown[] {
    const [, min = 0, max = 5, itemTemplate = 'nil', head = [], tail = []] = template;
    const length = this.minmax(min, max);
    const result: unknown[] = [];
    for (const tpl of head) result.push(this.generate(tpl));
    for (let i = 0; i < length; i++) result.push(this.generate(itemTemplate));
    for (const tpl of tail) result.push(this.generate(tpl));
    return result;
  }

  protected generateObject(template: ObjectTemplate): Record<string, unknown> {
    const [, fields = []] = template;
    const result: Record<string, unknown> = {};
    for (const field of fields) {
      const [keyToken, valueTemplate = 'nil', optionality = 0] = field;
      if (optionality) {
        if (this.nodes > this.maxNodes) continue;
        if (Math.random() < optionality) continue;
      }
      const key = randomString(keyToken ?? templates.tokensObjectKey);
      const value = this.generate(valueTemplate);
      result[key] = value;
    }
    return result;
  }

  protected generateMap(template: MapTemplate): Record<string, unknown> {
    const [, keyToken, valueTemplate = 'nil', min = 0, max = 5] = template;
    const length = this.minmax(min, max);
    const result: Record<string, unknown> = {};
    const token = keyToken ?? templates.tokensObjectKey;
    for (let i = 0; i < length; i++) {
      const key = randomString(token);
      const value = this.generate(valueTemplate);
      result[key] = value;
    }
    return result;
  }

  protected generateString(template: StringTemplate): string {
    return randomString(template[1] ?? templates.tokensHelloWorld);
  }

  protected generateNumber([, min, max]: NumberTemplate): number {
    if (Math.random() > 0.5) return this.generateInteger(['int', min, max]);
    else return this.generateFloat(['float', min, max]);
  }

  protected generateInteger(template: IntegerTemplate): number {
    const [, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER] = template;
    return int(min, max);
  }

  protected generateInt64(template: Int64Template): bigint {
    const [, min = BigInt('-9223372036854775808'), max = BigInt('9223372036854775807')] = template;
    return int64(min, max);
  }

  protected generateFloat(template: FloatTemplate): number {
    const [, min = -Number.MAX_VALUE, max = Number.MAX_VALUE] = template;
    let float = Math.random() * (max - min) + min;
    float = Math.max(min, Math.min(max, float));
    return float;
  }

  protected generateBoolean(template: BooleanTemplate): boolean {
    const value = template[1];
    return value !== undefined ? value : Math.random() < 0.5;
  }

  protected generateBin(template: BinTemplate): Uint8Array {
    const [, min = 0, max = 5, omin = 0, omax = 255] = template;
    const length = this.minmax(min, max);
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = int(omin, omax);
    }
    return result;
  }

  protected generateLiteral(template: LiteralTemplate): unknown {
    return clone(template[1]);
  }

  protected generateOr(template: OrTemplate): unknown {
    const [, ...options] = template;
    const index = int(0, options.length - 1);
    return this.generate(options[index]);
  }
}
