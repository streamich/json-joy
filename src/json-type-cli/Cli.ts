import {parseArgs} from 'node:util';
import {TypeSystem} from '../json-type/system/TypeSystem';
import {ObjectValueCaller} from '../reactive-rpc/common/rpc/caller/ObjectValueCaller';
import {bufferToUint8Array} from '@jsonjoy.com/util/lib/buffers/bufferToUint8Array';
import {formatError} from './util';
import {defineBuiltinRoutes} from './methods';
import {defaultParams} from './defaultParams';
import {ObjectValue} from '../json-type-value/ObjectValue';
import type {CliCodecs} from './CliCodecs';
import type {TypeBuilder} from '../json-type/type/TypeBuilder';
import type {WriteStream, ReadStream} from 'tty';
import type {CliCodec, CliContext, CliParam, CliParamInstance} from './types';
import type {Value} from '../json-type-value/Value';

export interface CliOptions<Router extends ObjectValue<any>> {
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

export class Cli<Router extends ObjectValue<any> = ObjectValue<any>> {
  public router: Router;
  public readonly params: CliParam[];
  public readonly paramMap: Map<string, CliParam>;
  public readonly types: TypeSystem;
  public readonly t: TypeBuilder;
  public readonly caller: ObjectValueCaller<Router>;
  public readonly codecs: CliCodecs;
  public request?: unknown;
  public response?: unknown;
  public argv: string[];
  public stdout: WriteStream;
  public stderr: WriteStream;
  public stdin: ReadStream;
  public exit: (errno: number) => void;
  public requestCodec: CliCodec;
  public responseCodec: CliCodec;
  public rawStdinInput?: Uint8Array;
  public stdinInput?: unknown;
  protected paramInstances: CliParamInstance[] = [];

  public constructor(public readonly options: CliOptions<Router>) {
    let router = options.router ?? (ObjectValue.create(new TypeSystem()) as any);
    router = defineBuiltinRoutes(router);
    this.router = router;
    this.params = options.params ?? defaultParams;
    this.paramMap = new Map();
    for (const param of this.params) {
      this.paramMap.set(param.param, param);
      if (param.short) this.paramMap.set(param.short, param);
    }
    this.caller = new ObjectValueCaller({router, wrapInternalError: (err) => err});
    this.types = router.system;
    this.t = this.types.t;
    this.codecs = options.codecs;
    this.requestCodec = this.codecs.get(this.codecs.defaultCodec);
    this.responseCodec = this.codecs.get(this.codecs.defaultCodec);
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
      const system = this.router.system;
      for (const key of this.router.keys()) system.alias(key, this.router.get(key).type);
      const args = parseArgs({
        args: this.argv,
        strict: false,
        allowPositionals: true,
      });
      for (let argKey of Object.keys(args.values)) {
        let pointer = '';
        const value = args.values[argKey];
        const slashIndex = argKey.indexOf('/');
        if (slashIndex !== -1) {
          pointer = argKey.slice(slashIndex);
          argKey = argKey.slice(0, slashIndex);
        }
        const param = this.param(argKey);
        if (!param) {
          throw new Error(`Unknown parameter "${argKey}"`);
        }
        const instance = param.createInstance(this, pointer, value);
        this.paramInstances.push(instance);
        if (instance.onParam) await instance.onParam();
      }
      const method = args.positionals[0];
      if (!method) {
        const param = this.param('help');
        const instance = param?.createInstance(this, '', undefined);
        instance?.onParam?.();
        throw new Error('No method specified');
      }
      this.request = JSON.parse(args.positionals[1] || '{}');
      await this.readStdin();
      for (const instance of this.paramInstances) if (instance.onStdin) await instance.onStdin();
      for (const instance of this.paramInstances) if (instance.onRequest) await instance.onRequest();
      try {
        const ctx: CliContext<Router> = {cli: this};
        for (const instance of this.paramInstances) if (instance.onBeforeCall) await instance.onBeforeCall(method, ctx);
        const value = await this.caller.call(method, this.request as any, ctx);
        this.response = (value as Value<any>).data;
        for (const instance of this.paramInstances) if (instance.onResponse) await instance.onResponse();
        const buf = this.responseCodec.encode(this.response);
        this.stdout.write(buf);
      } catch (err) {
        const error = formatError(err);
        const buf = this.responseCodec.encode(error);
        this.stderr.write(buf);
        this.exit(1);
      }
    } catch (err) {
      const error = formatError(err);
      const buf = JSON.stringify(error, null, 4);
      this.stderr.write(buf);
      this.exit(1);
    }
  }

  public cmd(): string {
    return this.options.cmd ?? '<cmd>';
  }

  private async getStdin(): Promise<Buffer> {
    const stdin = this.stdin;
    if (stdin.isTTY) return Buffer.alloc(0);
    const result = [];
    let length = 0;
    for await (const chunk of stdin) {
      result.push(chunk);
      length += chunk.length;
    }
    return Buffer.concat(result, length);
  }

  private async readStdin(): Promise<void> {
    const stdin = this.stdin;
    const codec = this.requestCodec;
    if (stdin.isTTY) return Object.create(null);
    const input = await this.getStdin();
    if (codec.id === 'json') {
      const str = input.toString().trim();
      if (!str) return Object.create(null);
    }
    this.rawStdinInput = bufferToUint8Array(input);
    this.stdinInput = codec.decode(this.rawStdinInput);
  }
}
