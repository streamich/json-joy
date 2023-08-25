import {parseArgs} from 'util';
import {Codecs} from '../json-pack/codecs/Codecs';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {TypedApiCaller} from '../reactive-rpc/common/rpc/caller/TypedApiCaller';
import {Writer} from '../util/buffers/Writer';
import type {FilterFunctions, SchemaOf, Type, TypeMap, TypeOf} from '../json-type';
import type {Value} from '../reactive-rpc/common/messages/Value';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';

// export interface CliMethodRegistration<Req extends Type, Res extends Type> {
//   name: string;
//   req: Req;
//   res: Res;
//   exec: (req: TypeOf<SchemaOf<Req>>) => Promise<TypeOf<SchemaOf<Res>>>;
// }

export interface CliOptions<Types> {
  define: (t: TypeSystem) => Types;
  implement: (caller: TypedApiCaller<FilterFunctions<TypeMap>>) => void;
}

export class Cli {
  protected readonly system: TypeSystem;
  public readonly t: TypeBuilder;
  protected readonly caller: TypedApiCaller<FilterFunctions<TypeMap>>;
  protected readonly writer: Writer;
  protected readonly codecs: Codecs;

  public constructor() {
    const system = (this.system = new TypeSystem());
    this.t = this.system.t;
    // system.importTypes(opts.define(system));
    const caller = (this.caller = new TypedApiCaller<FilterFunctions<TypeMap>>({system: this.system}));
    // opts.implement(caller);
    this.writer = new Writer();
    this.codecs = new Codecs(this.writer);
  }

  public register = <Req extends Type, Res extends Type>(
    name: string,
    req: Req,
    res: Res,
    call: (req: TypeOf<SchemaOf<Req>>) => Promise<TypeOf<SchemaOf<Res>>>,
  ): void => {
    this.system.alias(name, this.t.Function(req, res));
    (this.caller as any).implement(name, {
      req,
      res,
      call,
    });
  };

  public run(argv: string[] = process.argv.slice(2)): void {
    const args = parseArgs({
      args: argv,
      strict: false,
      allowPositionals: true,
    });
    const methodName = args.positionals.join('.');
    const request = args.values;
    this.caller
      .call(methodName, request, {})
      .then((value) => {
        this.writer.reset();
        value.encode(this.codecs.json);
        const buf = this.writer.flush();
        process.stdout.write(buf);
      })
      .catch((err) => {
        const value = err as Value;
        this.writer.reset();
        value.encode(this.codecs.json);
        const buf = this.writer.flush();
        process.stdout.write(buf);
      });
  }
}
