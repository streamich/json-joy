import {
  Kit,
  setupHelloWorldKit,
  setupHelloWorldWithFewEditsKit,
  setupNumbersKit,
  setupNumbersWithTombstonesKit,
} from '../../__tests__/setup';

const run = (setup: () => Kit) => {
  test('can produce text for all possible ranges', () => {
    const {peritext} = setup();
    const length = peritext.strApi().length();
    const str = peritext.strApi().view();
    for (let i = 0; i < length - 1; i++) {
      for (let j = 1; j <= length - i - i; j++) {
        const range = peritext.rangeAt(i, j);
        expect(range.text()).toBe(str.slice(i, i + j));
        // console.log(str.slice(i, i + j));
      }
    }
  });
};

describe('no edits "hello world"', () => {
  run(setupHelloWorldKit);
});

describe('some edits "hello world"', () => {
  run(setupHelloWorldWithFewEditsKit);
});

describe('no edits "number"', () => {
  run(setupNumbersKit);
});

describe('heavy edits "number"', () => {
  run(setupNumbersWithTombstonesKit);
});
