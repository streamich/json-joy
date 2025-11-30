import {FromSlate} from '../FromSlate';
import * as traces from './traces';

describe('FromSlate', () => {
  describe('convert()', () => {
    test('single text paragraph', () => {
      const runner = traces.RunTrace.from(traces.variousOperations);
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      runner.next();
      // console.log(JSON.stringify(runner.state(), null, 2));
      const view = FromSlate.convert(runner.state());
      // console.log('VIEW:', JSON.stringify(view, null, 2));
    });
  });
});
