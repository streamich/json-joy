import {
  type Kit,
  setupHelloWorldKit,
  setupHelloWorldWithFewEditsKit,
  setupNumbersKit,
  setupNumbersWithMultipleChunksAndDeletesKit,
  setupNumbersWithRgaSplitKit,
  setupNumbersWithTombstonesKit,
  setupNumbersWithTwoChunksKit,
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

describe('numbers "0123456789", no edits', () => {
  run(setupNumbersKit);
});

describe('numbers "0123456789", with default schema and tombstones', () => {
  run(setupNumbersWithTombstonesKit);
});

describe('numbers "0123456789", two RGA chunks', () => {
  run(setupNumbersWithTwoChunksKit);
});

describe('numbers "0123456789", with RGA split', () => {
  run(setupNumbersWithRgaSplitKit);
});

describe('numbers "0123456789", with multiple deletes', () => {
  run(setupNumbersWithMultipleChunksAndDeletesKit);
});
