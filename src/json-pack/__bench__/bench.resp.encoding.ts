// npx ts-node src/json-pack/__bench__/bench.resp.encoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {RespEncoder} from '../resp/RespEncoder';
import encodeCommand from '@redis/client/dist/lib/client/RESP2/encoder';

const data = ['set', 'production:project-name:keys:foobarbaz', 'PX', 'NX', 'EX', '60000', 'KEEPTTL'];
const redisClientEncode = (cmd: string[]) => {
  const list = encodeCommand(data);
  return Buffer.from(list.join(''));
};

const benchmark: IBenchmark = {
  name: 'Encoding RESP',
  warmup: 1000,
  payloads: [
    {
      name: 'short array',
      data,
    },
  ],
  runners: [
    {
      name: 'json-joy/json-pack RespEncoder.encode()',
      setup: () => {
        const encoder = new RespEncoder();
        return (data: any) => {
          encoder.encode(data);
        }
      },
    },
    {
      name: '@redis/client',
      setup: () => {
        return (data: any) => {
          redisClientEncode(data);
        }
      },
    },
  ],
};

runBenchmark(benchmark);
