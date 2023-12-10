// npx ts-node src/json-pack/__bench__/bench.resp.decoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {RespEncoder} from '../resp/RespEncoder';
import {RespDecoder} from '../resp/RespDecoder';

const encoder = new RespEncoder();
const data = encoder.encode(['set', 'production:project-name:keys:foobarbaz', 'PX', 'NX', 'EX', 60000, 'KEEPTTL']);

const benchmark: IBenchmark = {
  name: 'Decoding RESP',
  warmup: 1000,
  payloads: [
    {
      name: 'short array',
      data,
    },
  ],
  runners: [
    {
      name: 'json-joy/json-pack RespDecoder.decode()',
      setup: () => {
        const decoder = new RespDecoder();
        return (data: any) => {
          decoder.read(data);
        }
      },
    },
    {
      name: 'redis-parser',
      setup: () => {
        const Parser = require('redis-parser');
        let result: unknown;
        const parser = new Parser({
          returnReply(reply: any, b: any, c: any) {
            result = reply;
          },
          returnError(err: any) {
            result = err;
          },
          returnFatalError(err: any) {
            result = err;
          },
          returnBuffers: false,
          stringNumbers: false,
        });
        const parse = (uint8: Uint8Array): unknown => {
          parser.execute(Buffer.from(uint8));
          return result;
        };
        return (data: any) => {
          parse(data);
        }
      },
    },
  ],
};

runBenchmark(benchmark);
