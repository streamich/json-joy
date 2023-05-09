import {printBinary} from '../printBinary';

test('renders a single left child', () => {
  const str = 'Node' + printBinary('', [() => `foo`]);
  expect(str).toBe(
    `Node
← foo`,
  );
});

test('renders a single right child', () => {
  const str = 'Node' + printBinary('', [null, () => `foo`]);
  expect(str).toBe(
    `Node
→ foo`,
  );
});

test('renders one level of left and right children', () => {
  const str = 'Node' + printBinary('', [() => 'left', () => 'right']);
  expect(str).toBe(
    `Node
← left
→ right`,
  );
});

test('renders two levels of left and right children', () => {
  const str =
    'Node' +
    printBinary('', [
      (tab) => 'left' + printBinary(tab, [() => 'left', () => 'right']),
      (tab) => 'right' + printBinary(tab, [() => 'left', () => 'right']),
    ]);
  expect(str).toBe(
    `Node
← left
  ← left
  → right
→ right
  ← left
  → right`,
  );
});
