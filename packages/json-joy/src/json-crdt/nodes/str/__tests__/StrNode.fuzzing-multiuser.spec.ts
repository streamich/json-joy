import {StrNodeFuzzer, type StrNodeFuzzerOptions} from './StrNodeFuzzer';

const execute = (times: number, options?: Partial<StrNodeFuzzerOptions>) => {
  for (let i = 0; i < times; i++) {
    const fuzzer = new StrNodeFuzzer(options);
    fuzzer.generatePrelude();
    try {
      fuzzer.assertSiteViewsEqual();
      fuzzer.executeEditingSessionsAndAssert();
      // console.log(fuzzer + '');
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(fuzzer + '');
      throw error;
    }
  }
};

describe('multi-user parallel editing fuzzing scenarios', () => {
  test('default fuzzer options', () => {
    execute(100);
  });

  test('minimal trace', () => {
    execute(1, {
      maxInsertLength: 5,
      maxPatchLength: 3,
      maxPreludeLength: 3,
      maxSiteCount: 3,
      minEditingSessionCount: 2,
      maxEditingSessionCount: 2,
    });
  });

  test('inserts only', () => {
    execute(100, {
      deleteProbability: 0,
    });
  });

  test('only two users', () => {
    execute(100, {
      minEditingSessionCount: 2,
      maxEditingSessionCount: 2,
    });
  });

  test('only three users', () => {
    execute(100, {
      minEditingSessionCount: 3,
      maxEditingSessionCount: 3,
    });
  });

  test('long patches', () => {
    execute(2, {
      minPatchLength: 100,
      maxPatchLength: 200,
      minEditingSessionCount: 2,
      maxEditingSessionCount: 4,
    });
  });

  test('short patches', () => {
    execute(200, {
      minPatchLength: 0,
      maxPatchLength: 3,
    });
  });

  test('short deletes', () => {
    execute(200, {
      maxDeleteLength: 3,
    });
  });
});
