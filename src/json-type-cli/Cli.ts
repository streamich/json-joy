import {parseArgs} from 'node:util';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {RoutesBase, TypeRouter} from '../json-type/system/TypeRouter';
import {TypeRouterCaller} from '../reactive-rpc/common/rpc/caller/TypeRouterCaller';
import {bufferToUint8Array} from '../util/buffers/bufferToUint8Array';
import {applyPatch} from '../json-patch';
import {formatError, ingestParams} from './util';
import {find, validateJsonPointer, toPath} from '../json-pointer';
import {defineBuiltinRoutes} from './methods';
import {defaultParams} from './defaultParams';
import type {CliCodecs} from './CliCodecs';
import type {Value} from '../reactive-rpc/common/messages/Value';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';
import type {WriteStream, ReadStream} from 'tty';
import type {CliCodec, CliContext, CliParam} from './types';

export interface CliOptions<Router extends TypeRouter<any>> {
  codecs: CliCodecs;
  params?: CliParam[];
  router?: Router;
  version?: string;
  cmd?: string;
  argv?: string[];
  stdout?: WriteStream;
  stderr?: WriteStream;
  stdin?: ReadStream;
  exit?: (errno: number) => void;
}

export class Cli<Router extends TypeRouter<RoutesBase> = TypeRouter<RoutesBase>> {
  public router: Router;
  public readonly params: CliParam[];
  public readonly paramMap: Map<string, CliParam>;
  public readonly types: TypeSystem;
  public readonly t: TypeBuilder;
  public readonly caller: TypeRouterCaller<Router>;
  public readonly codecs: CliCodecs;
  public request: unknown;
  public argv: string[];
  public stdout: WriteStream;
  public stderr: WriteStream;
  public stdin: ReadStream;
  public exit: (errno: number) => void;

  public constructor(public readonly options: CliOptions<Router>) {
    let router = options.router ?? (TypeRouter.create() as any);
    router = defineBuiltinRoutes(router);
    this.router = router;
    this.params = options.params ?? defaultParams;
    this.paramMap = new Map();
    for (const param of this.params) {
      this.paramMap.set(param.param, param);
      if (param.short) this.paramMap.set(param.short, param);
    }
    this.caller = new TypeRouterCaller({router, wrapInternalError: (err) => err});
    this.types = router.system;
    this.t = this.types.t;
    this.codecs = options.codecs;
    this.argv = options.argv ?? process.argv.slice(2);
    this.stdin = options.stdin ?? process.stdin;
    this.stdout = options.stdout ?? process.stdout;
    this.stderr = options.stderr ?? process.stderr;
    this.exit = options.exit ?? process.exit;
  }

  public run(): void {
    this.runAsync();
  }

  public param(param: string): CliParam | undefined {
    return this.paramMap.get(param);
  }

  public async runAsync(): Promise<void> {
    try {
      const args = parseArgs({
        args: this.argv,
        strict: false,
        allowPositionals: true,
      });
      for (const argKey of Object.keys(args.values)) {
        const param = this.param(argKey);
        if (!param) {
          throw new Error(`Unknown parameter "${argKey}"`);
        }
        const value = args.values[argKey];
        const instance = param.createInstance(this, '', value);
        if (instance.onParam) await instance.onParam();
      }
      const methodName = args.positionals[0];
      this.request = JSON.parse(args.positionals[1] || '{}');
      const {
        f: format_ = '',
        format = format_,
        stdin: inPath_ = '',
        in: inPath = inPath_,
        stdout: outPath_ = '',
        out: outPath = outPath_,
        ...params
      } = args.values;
      if (inPath) validateJsonPointer(inPath);
      if (outPath) validateJsonPointer(outPath);
      const codecs = this.codecs.getCodecs(format);
      const [requestCodec, responseCodec] = codecs;
      this.request = await this.ingestStdinInput(this.stdin, requestCodec, this.request, String(inPath));
      await ingestParams(params, this.request, this.codecs, requestCodec);
      const ctx: CliContext<Router> = {
        cli: this,
        codecs,
      };
      try {
        const value = await this.caller.call(methodName, this.request as any, ctx);
        let response = (value as Value).data;
        if (outPath) response = find(response, toPath(String(outPath))).val;
        const buf = responseCodec.encode(response);
        this.stdout.write(buf);
      } catch (err) {
        const error = formatError(err);
        const buf = responseCodec.encode(error);
        this.stderr.write(buf);
        this.exit(1);
      }
    } catch (err) {
      const error = formatError(err);
      const buf = JSON.stringify(error);
      this.stderr.write(buf);
      this.exit(1);
    }
  }

  private async ingestStdinInput(stdin: ReadStream, codec: CliCodec, request: unknown, path: string): Promise<unknown> {
    const input = await this.getStdinValue(stdin, codec);
    if (input === undefined) return request;
    if (path) {
      const res = applyPatch(request, [{op: 'add', path, value: input}], {mutate: true});
      return res.doc;
    }
    if (typeof request === 'object') {
      if (typeof input === 'object') return {...request, ...input};
      return {...request, input};
    }
    return input;
  }

  public cmd(): string {
    return this.options.cmd ?? '<cmd>';
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

  private async getStdinValue(stdin: ReadStream, codec: CliCodec): Promise<unknown> {
    if (stdin.isTTY) return Object.create(null);
    const input = await this.getStdin(stdin);
    if (codec.id === 'json') {
      const str = input.toString().trim();
      if (!str) return Object.create(null);
    }
    const uint8 = bufferToUint8Array(input);
    return codec.decode(uint8);
  }
}
