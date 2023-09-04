import {parseArgs} from 'node:util';
import {Codecs} from '../json-pack/codecs/Codecs';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {Writer} from '../util/buffers/Writer';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {FunctionType} from '../json-type/type/classes';
import type {Value} from '../reactive-rpc/common/messages/Value';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';

export class Cli<Router extends TypeRouter<any>> {
  protected readonly system: TypeSystem;
  public readonly t: TypeBuilder;
  protected readonly writer: Writer;
  protected readonly codecs: Codecs;

  public constructor(public readonly router: Router) {
    this.system = router.system;
    this.t = this.system.t;
    this.writer = new Writer();
    this.codecs = new Codecs(this.writer);
  }

  public run(argv: string[] = process.argv.slice(2)): void {
    const args = parseArgs({
      args: argv,
      strict: false,
      allowPositionals: true,
    });
    const methodName = args.positionals.join('.');
    const request = args.values;
    const fn = this.router.routes[methodName];
    if (!(fn instanceof FunctionType)) throw new Error(`Method ${methodName} not found.`);
    const method = fn.singleton;
    if (!method) throw new Error(`Method ${methodName} not implemented.`);
    method(request, {})
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
