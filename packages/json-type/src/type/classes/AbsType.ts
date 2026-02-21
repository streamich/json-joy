import type {Printable} from 'tree-dump/lib/types';
import type * as schema from '../../schema';
import type {SchemaExample} from '../../schema';
import {Value} from '../../value';
import type {BaseType, ModuleType} from '../types';

export abstract class AbsType<S extends schema.Schema> implements BaseType<S>, Printable {
  /** Default type system to use, if any. */
  public system?: ModuleType;

  public readonly _validators: [validator: (value: unknown) => void, name?: string][] = [];

  constructor(public readonly schema: S) {}

  public sys(system: ModuleType | undefined): this {
    this.system = system;
    return this;
  }

  public getSystem(): ModuleType {
    const system = this.system;
    if (!system) throw new Error('NO_SYSTEM');
    return system;
  }

  public kind(): S['kind'] {
    return this.schema.kind;
  }

  public value(data: schema.TypeOf<S>) {
    return new Value<this>(data as any, this);
  }

  /**
   * @todo Add ability to export the whole schema, including aliases.
   */
  public getSchema(): S {
    return this.schema;
  }

  /**
   * Sets a custom runtime validator for this type.
   *
   * @param validator Function that validates the value of this type.
   * @returns `this` for chaining.
   */
  public validator(validator: (value: schema.TypeOf<S>) => void, name?: string): this {
    this._validators.push([validator as any, name]);
    return this;
  }

  public options(options: schema.Optional<Omit<S, 'kind'>>): this {
    const {kind, ...sanitizedOptions} = options as any;
    Object.assign(this.schema, sanitizedOptions);
    return this;
  }

  public title(title: string): this {
    this.schema.title = title;
    return this;
  }

  public intro(intro: string): this {
    this.schema.intro = intro;
    return this;
  }

  public description(description: string): this {
    this.schema.description = description;
    return this;
  }

  public default(value: schema.Schema['default']): this {
    this.schema.default = value;
    return this;
  }

  public example(
    value: schema.TypeOf<S>,
    title?: SchemaExample['title'],
    options?: Omit<SchemaExample, 'value' | 'title'>,
  ): this {
    const examples = (this.schema.examples ??= []);
    const example: SchemaExample = {...options, value};
    if (typeof title === 'string') example.title = title;
    examples.push(example);
    return this;
  }

  public getOptions(): schema.Optional<S> {
    const {kind, ...options} = this.schema;
    return options as any;
  }

  public alias<K extends string>(name: K) {
    return this.getSystem().alias(name, this);
  }

  protected toStringTitle(): string {
    return this.kind();
  }

  protected toStringOptions(): string {
    const options = this.getOptions() as schema.Display;
    const title = options.title || options.intro || options.description;
    if (!title) return '';
    return JSON.stringify(title);
  }

  public toString(tab: string = ''): string {
    const options = this.toStringOptions();
    return this.toStringTitle() + (options ? ` ${options}` : '');
  }
}
