/* tslint:disable no-console */

import * as Benchmark from 'benchmark';
import * as os from 'os';
import * as fs from 'fs';

export interface Runner {
  name: string | ((data: unknown) => string);
  setup: (data: unknown) => (data: unknown) => void;
}

export interface Payload {
  name: string | ((data: unknown) => string);
  data: unknown;
}

export interface IBenchmark {
  name: string;
  description?: string;
  warmup?: number;
  payloads?: Payload[];
  test?: (payload: unknown, result: unknown) => boolean;
  runners: Runner[];
}

export type PayloadResult = [suite: Benchmark.Suite, payload: Payload, events: Benchmark.Event[]];

export const runBenchmark = (benchmark: IBenchmark): PayloadResult[] => {
  const title = 'Benchmark: ' + (benchmark.name || '[unknown benchmark]');
  console.log('='.repeat(100 - title.length - 2) + ' ' + title);

  const warmup = !benchmark.warmup ? 'Not specified' : `${benchmark.warmup}x`;
  const version = process.version;
  const arch = os.arch();
  const cpu = os.cpus()[0].model;

  console.log('Warmup:', warmup, ', Node.js:', version, ', Arch:', arch, ', CPU:', cpu);

  const result: PayloadResult[] = [];

  for (const payload of benchmark.payloads || [{name: 'No payload', data: undefined, test: undefined}]) {
    const suite = new Benchmark.Suite();
    const data = payload?.data;
    const name = payload?.name || '[unknown payload]';
    const title = typeof name === 'function' ? name(data) : name;
    console.log('-'.repeat(100 - title.length - 2) + ' ' + title);

    for (const runner of benchmark.runners) {
      const fn = runner.setup(data);
      if (benchmark.warmup) for (let i = 0; i < benchmark.warmup; i++) fn(data);
      let isCorrect: undefined | boolean = undefined;
      if (benchmark.test) {
        try {
          isCorrect = benchmark.test(data, fn(data));
        } catch {
          isCorrect = false;
        }
      }
      const icon = isCorrect === undefined ? '' : isCorrect ? '👍' : '👎';
      suite.add((icon ? icon + ' ' : '') + (typeof runner.name === 'function' ? runner.name(data) : runner.name), () =>
        fn(data),
      );
    }

    const events: Benchmark.Event[] = [];
    suite.on('cycle', (event: Benchmark.Event) => {
      events.push(event);
      console.log(String(event.target));
    });
    suite.on('complete', () => {
      console.log(`Fastest is ${suite.filter('fastest').map('name')}`);
    });
    suite.run();

    result.push([suite, payload, events]);
  }

  return result;
};

export interface IBenchmarkResult {
  id: number;
  name?: string;
  count: number;
  cycles: number;
  hz: number;
  compiled: (() => void) | string;
  error: Error;
  fn: (() => void) | string;
  aborted: boolean;
  running: boolean;
  setup: (() => void) | string;
  teardown: (() => void) | string;
  stats: Benchmark.Stats;
  times: Benchmark.Times;
}

export const formatSuite = ([suite, payload, events]: PayloadResult): string => {
  let str = '';
  const name = typeof payload.name === 'function' ? payload.name(payload.data) : payload.name;
  str += `\n## Payload: __${name}__\n`;
  str += '\n';
  for (const event of events) {
    str += `- ${event.target}\n`;
  }
  str += '\n';
  str += `Fastest is __${suite.filter('fastest').map('name')}__\n`;
  str += '\n';
  return str;
};

export const formatSuites = (benchmark: IBenchmark, result: PayloadResult[]): string => {
  let str = '';
  str += `# Benchmark report: __${benchmark.name}__\n`;
  str += '\n';
  const warmup = !benchmark.warmup ? 'Not specified' : `${benchmark.warmup}x`;
  const version = process.version;
  const arch = os.arch();
  const cpu = os.cpus()[0].model;
  str += `> Warmup: ${warmup}, Node.js: ${version}, Arch: ${arch}, CPU: ${cpu}\n`;
  str += '\n';
  if (benchmark.description) str += benchmark.description + '\n';
  str += '\n';
  for (const res of result) str += formatSuite(res);
  return str;
};

export const runBenchmarkAndSave = (benchmark: IBenchmark, path: string): void => {
  fs.mkdirSync(path, {recursive: true});
  const results = runBenchmark(benchmark);
  const markdown = formatSuites(benchmark, results);
  fs.writeFileSync(path + `/${benchmark.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`, markdown);
};
