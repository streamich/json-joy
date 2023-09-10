import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamFormat implements CliParam {
  public readonly param = 'format';
  public readonly short = 'fmt';
  public readonly title = 'Codec to use for req/res';
  public readonly example = '--fmt=json:cbor';
  public readonly help =
    'Codec format to use for encoding/decoding request/response values. To specify both request and response codecs use "<codec>", or "<reqCodec>:<resCodec>" to specify them separately.';
  public readonly examples = ['--format=cbor', '--format=cbor:json', '--fmt=json:msgpack', '--fmt=json:tree'];
  public readonly createInstance = (cli: Cli, pointer: string, value: unknown) =>
    new (class implements CliParamInstance {
      public readonly onParam = async () => {
        const format = String(value);
        const codecs = cli.codecs.getCodecs(format);
        const [requestCodec, responseCodec] = codecs;
        cli.requestCodec = requestCodec;
        cli.responseCodec = responseCodec;
      };
    })();
}
