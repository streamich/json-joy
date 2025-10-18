import type * as schema from '../../schema';
import {AbsType} from './AbsType';

export class NumType extends AbsType<schema.NumSchema> {
  public format(format: schema.NumSchema['format']): this {
    this.schema.format = format;
    return this;
  }

  public gt(gt: schema.NumSchema['gt']): this {
    this.schema.gt = gt;
    return this;
  }

  public gte(gte: schema.NumSchema['gte']): this {
    this.schema.gte = gte;
    return this;
  }

  public lt(lt: schema.NumSchema['lt']): this {
    this.schema.lt = lt;
    return this;
  }

  public lte(lte: schema.NumSchema['lte']): this {
    this.schema.lte = lte;
    return this;
  }
}
