import {parseArgs} from 'node:util';
import {Codecs} from '../json-pack/codecs/Codecs';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {Writer} from '../util/buffers/Writer';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import type {Value} from '../reactive-rpc/common/messages/Value';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';

export class Cli<Router extends TypeRouter<any>> {
  protected readonly system: TypeSystem;
  public readonly t: TypeBuilder;
  public readonly caller: TypeRouterCaller<Router>;
  protected readonly writer: Writer;
  protected readonly codecs: Codecs;

  public constructor(public readonly router: Router) {
    this.caller = new TypeRouterCaller({router});
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
    const methodName = args.positionals[0];
    const request = {
      ...JSON.parse(args.positionals[1] || '{}'),
      ...args.values,
    };
    this.caller.call(methodName, request as any, {})
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
