import type * as schema from '../../schema';
import {AbsType} from './AbsType';

export class ConType<V = any> extends AbsType<schema.ConSchema<V>> {
  public literal() {
    return this.schema.value;
  }

  public getOptions(): schema.Optional<schema.ConSchema<V>> {
    const {kind, value, ...options} = this.schema;
    return options as any;
  }

  public toString(tab: string = ''): string {
    return `${super.toString(tab)} → ${JSON.stringify(this.schema.value)}`;
  }
}
