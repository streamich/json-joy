import {printTree} from '../printTree';

test('renders a single child node', () => {
  const str = 'Node' + printTree('', [() => `foo`]);

  expect(str).toBe(
    `Node
└─ foo`,
  );
});

test('renders two children node', () => {
  const str = 'Node' + printTree('', [() => `foo`, () => `bar`]);

  expect(str).toBe(
    `Node
├─ foo
└─ bar`,
  );
});

test('renders two levels of nodes', () => {
  const str = 'Node' + printTree('', [() => `foo`, (tab) => `bar` + printTree(tab, [() => `baz`])]);

  expect(str).toBe(
    `Node
├─ foo
└─ bar
   └─ baz`,
  );
});

test('renders two levels of nodes, with double tree line', () => {
  const str =
    'Node' +
    printTree('', [(tab) => `foo` + printTree(tab, [() => `baz`]), (tab) => `bar` + printTree(tab, [() => `baz`])]);

  expect(str).toBe(
    `Node
├─ foo
│  └─ baz
└─ bar
   └─ baz`,
  );
});
