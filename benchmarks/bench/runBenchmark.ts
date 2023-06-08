import {deepEqual} from '../../src/json-equal/deepEqual';
const Benchmark = require('benchmark');
const os = require('os');

export interface Runner {
  name: string;
  setup: (data: unknown) => (data: unknown) => void;
}

export interface Payload {
  name: string | ((data: unknown) => string);
  data: unknown;
}

export interface Benchmark {
  name?: string;
  warmup?: number;
  payloads?: Payload[];
  test?: (payload: unknown, result: unknown) => boolean;
  runners: Runner[];
}

export const runBenchmark = (benchmark: Benchmark) => {
  const title = 'Benchmark: ' + (benchmark.name || '[unknown benchmark]');
  console.log('='.repeat(100 - title.length - 2) + ' ' + title);

  const warmup = !benchmark.warmup ? 'Not specified' : `${benchmark.warmup}x`;
  const version = process.version;
  const arch = os.arch();
  const cpu = os.cpus()[0].model;

  console.log('Warmup:', warmup, ', Node.js:', version, ', Arch:', arch, ', CPU:', cpu);

  for (const payload of (benchmark.payloads || [{name: 'No payload', data: undefined, test: undefined}])) {
    const suite = new Benchmark.Suite;
    const data = payload?.data;
    const name = payload?.name || '[unknown payload]';
    const title = typeof name === 'function' ? name(data) : name;
    console.log('-'.repeat(100 - title.length - 2) + ' ' + title);

    for (const runner of benchmark.runners) {
      const fn = runner.setup(data);
      if (benchmark.warmup)
        for (let i = 0; i < benchmark.warmup; i++) fn(data);
      let isCorrect: undefined | boolean = undefined;
      if (benchmark.test) {
        try {
          isCorrect = benchmark.test(data, fn(data));
        } catch {
          isCorrect = false;
        }
      }
      const icon = isCorrect === undefined ? '🤞' : isCorrect ? '👍' : '👎';
      suite.add(icon + ' ' + runner.name, () => fn(data));
    }
    
    suite.on('cycle', (event: any) => {
      console.log(String(event.target));
    });
    suite.on('complete', () => {
      console.log(`Fastest is ${suite.filter('fastest').map('name')}`);
    });
    suite.run();
  }
};
