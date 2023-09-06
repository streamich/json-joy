import {parseArgs} from 'node:util';
import {Codecs} from '../json-pack/codecs/Codecs';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {Writer} from '../util/buffers/Writer';
import {TypeRouter} from '../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import type {Value} from '../reactive-rpc/common/messages/Value';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';
import type {WriteStream, ReadStream} from 'tty';

export interface CliOptions<Router extends TypeRouter<any>> {
  router?: Router;
}

export interface RunOptions {
  argv?: string[];
  stdout?: WriteStream;
  stderr?: WriteStream;
  stdin?: ReadStream;
}

export class Cli<Router extends TypeRouter<any>> {
  public router: Router;
  protected readonly system: TypeSystem;
  public readonly t: TypeBuilder;
  public readonly caller: TypeRouterCaller<Router>;
  protected readonly writer: Writer;
  protected readonly codecs: Codecs;

  public constructor(options: CliOptions<Router> = {}) {
    const router = (this.router = options.router ?? (TypeRouter.create() as any));
    this.caller = new TypeRouterCaller({router});
    this.system = router.system;
    this.t = this.system.t;
    this.writer = new Writer();
    this.codecs = new Codecs(this.writer);
  }

  public run(options?: RunOptions): void {
    this.runAsync(options).catch(() => {});
  }

  public async runAsync(options: RunOptions = {}): Promise<void> {
    const argv: string[] = options.argv ?? process.argv.slice(2);
    const stdin = options.stdin ?? process.stdin;
    const stdout = options.stdout ?? process.stdout;
    const stderr = options.stderr ?? process.stderr;
    const input = await this.getStdin(stdin);
    const args = parseArgs({
      args: argv,
      strict: false,
      allowPositionals: true,
    });
    const methodName = args.positionals[0];
    const request = {
      ...(input ? JSON.parse(input.toString()) : {}),
      ...JSON.parse(args.positionals[1] || '{}'),
      ...args.values,
    };
    this.caller
      .call(methodName, request as any, {})
      .then((value) => {
        this.writer.reset();
        value.encode(this.codecs.json);
        const buf = this.writer.flush();
        stdout.write(buf);
      })
      .catch((err) => {
        const value = err as Value;
        this.writer.reset();
        value.encode(this.codecs.json);
        const buf = this.writer.flush();
        stderr.write(buf);
      });
  }

  private async getStdin(stdin: ReadStream): Promise<Buffer> {
    if (stdin.isTTY) return Buffer.alloc(0);
    const result = [];
    let length = 0;
    for await (const chunk of stdin) {
      result.push(chunk);
      length += chunk.length;
    }
    return Buffer.concat(result, length);
  }
}
