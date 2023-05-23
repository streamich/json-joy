import type {TypeOf} from '../schema';
import type {SchemaOf} from '../type';
import type {TypeAlias, TypeOfAlias, TypeSystem} from '.';

export class Method<
  ID extends string,
  Req extends TypeAlias<any, any>,
  Res extends TypeAlias<any, any>,
  Ctx = unknown,
> {
  constructor(
    public readonly system: TypeSystem,
    public readonly id: ID,
    public readonly req: Req,
    public readonly res: Res,
    public readonly fn: (
      req: TypeOf<SchemaOf<TypeOfAlias<Req>>>,
      ctx: Ctx,
    ) => Promise<TypeOf<SchemaOf<TypeOfAlias<Res>>>>,
  ) {}
}
