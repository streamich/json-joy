import {get} from '@jsonjoy.com/json-pointer/lib/get';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';
import {validateJsonPointer} from '@jsonjoy.com/json-pointer/lib/validate';

export class Vars {
  protected readonly vars: Map<string, unknown> = new Map();

  constructor(public readonly env: unknown) {
    this.env = env;
  }

  public get(name: string): unknown {
    if (!name) return this.env;
    return this.vars.get(name);
  }

  public set(name: string, value: unknown): void {
    if (!name) throw new Error('Invalid varname.');
    this.vars.set(name, value);
  }

  public has(name: string): boolean {
    if (!name) return true;
    return this.vars.has(name);
  }

  public del(name: string): boolean {
    if (!name) throw new Error('Invalid varname.');
    return this.vars.delete(name);
  }

  public find(name: string, pointer: string): unknown {
    const data = this.get(name);
    validateJsonPointer(pointer);
    const path = toPath(pointer);
    return get(data, path);
  }
}
