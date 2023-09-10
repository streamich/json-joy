import type {Cli} from "../Cli";
import type {CliParam, CliParamInstance} from "../types";

export class CliParamFormat implements CliParam {
  public readonly param = 'format';
  public readonly short = 'f';
  public readonly title = 'Codec format to use for encoding/decoding request/response values. To specify both request and response codecs use "<codec>", or "<reqCodec>:<resCodec>" to specify them separately.';
  public readonly createInstance = (cli: Cli, pointer: string, value: unknown) => new class implements CliParamInstance {
    public readonly onParam = async () => {
      const format = String(value);
      const codecs = cli.codecs.getCodecs(format);
      const [requestCodec, responseCodec] = codecs;
      cli.requestCodec = requestCodec;
      cli.responseCodec = responseCodec;
    };
  }
}
