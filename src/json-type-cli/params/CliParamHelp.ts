import type {Cli} from '../Cli';
import type {CliParam, CliParamInstance} from '../types';

export class CliParamHelp implements CliParam {
  public readonly param = 'help';
  public readonly short = 'h';
  public readonly title = 'Print help and exit';
  public readonly createInstance = (cli: Cli, pointer: string, value: unknown) =>
    new (class implements CliParamInstance {
      public readonly onParam = async () => {
        const methods: string[] = Object.keys(cli.router.routes).sort();
        const methodLines = methods.map((m) => {
          const route = cli.router.routes[m];
          const schema = route.getSchema();
          let line = `- "${m}"`;
          if (schema.title) line += ` - ${schema.title}`;
          return line;
        });
        const cmd = cli.cmd();
        const codecLines = [...cli.codecs.codecs.values()].map((codec) => `- "${codec.id}" - ${codec.description}`);
        const text = `
JSON Type CLI uses request/response paradigm to execute CLI commands. Each
command is identified by the <method> name. Each command receives a JSON
object as the request payload and returns a JSON object as a response.

Request payload is composed from the following sources: (1) command line
second parameter; (2) STDIN input; (3) command line options.

Response object is returned to STDOUT. A part of it can be extracted using
the "--stdout" or "--out" option.

Usage:

    ${cmd} <method> '<json>'
    echo '<json>' | ${cmd} <method>
    ${cmd} <method> --<type><pointer>=<value>

Examples:

    ${cmd} .echo '{ "foo": 123 }'
    ${cmd} .echo --num/value=123
    ${cmd} .echo --json/value='{ "foo": 123 }' --out=/value
    echo '{ "foo": 123 }' | ${cmd} .echo
    ${cmd} .echo --s/foo=bar --format=cbor
    cat data.cbor | ${cmd} .echo --format=cbor:json
    ${cmd} .echo '{"foo": 123}' --f=cbor | ${cmd} .echo --f=cbor:tree

Options:

- "-h" or "--help" - Print this help.
- "-v" or "--version" - Print version.
- "--stdin" or "--in" - JSON pointer where to inject STDIN input.
- "--stdout" or "--out" - JSON pointer of response value for STDOUT.
- "--format" or "--f" - Codec format to use for encoding/decoding
  request/response values. To specify both request and response codecs use
  "<codec>", or "<reqCodec>:<resCodec>" to specify them separately.
  
  Available codecs:

  ${codecLines.join('\n  ')}

Method help:

    ${cmd} .type --out=/<method>
    ${cmd} .type --out=/<method>/description
    ${cmd} .type --out=/<method>/req
    ${cmd} .type --out=/<method>/res --format=tree

Methods:

${methodLines.join('\n')}

  `;
        cli.stdout.write(text);
        cli.exit(0);
      };
    })();
}
