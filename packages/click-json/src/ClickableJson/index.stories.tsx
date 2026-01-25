import * as React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ClickableJson, ClickableJsonProps} from '.';
import {applyPatch, Operation} from 'json-joy/lib/json-patch';

const meta: Meta<typeof Text> = {
  title: 'ClickableJson',
  component: ClickableJson as any,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;

const doc1 = {
  support: 'https://github.com/sponsors/streamich',
  license: 'use it if you support me',
  foo: null,
  test: 123,
  developer: {
    name: '@streamich',
  },
};

const doc2 = {
  id: 'pj7ryzaia1',
  model: 1.65555,
  cid: 'og6f0o9v1c',
  type: 'p',
  created: 1596445997247,
  modified: 1596445997381,
  pid: '92lmu7fs9a',
  depth: 0,
  mime: 'image/png',
  ext: 'png',
  file: 'image.png',
  w: 624,
  h: 1390,
  omark: [{x1: 0.027777777777777776, y1: 0.8438848920863309, x2: 0.25, y2: 0.8827338129496403}],
  isPost: true,
  isMature: false,
  parent: null,
  poster: {
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    name: 'Muhammad',
    list: [1, -5, true, false, null, 'asdf'],
  },
};

export const Primary: StoryObj<typeof meta> = {
  args: {
    doc: doc1,
    onChange: (patch: unknown) => console.log('onChange', patch),
  } as any,
};

export const Readonly: StoryObj<typeof meta> = {
  args: {
    doc: doc1,
    onChange: undefined,
  } as any,
};

export const FormalAndCompact: StoryObj<typeof meta> = {
  args: {
    doc: doc1,
    readonly: true,
    formal: true,
    compact: true,
  } as any,
};

const Demo: React.FC<ClickableJsonProps> = (props) => {
  const [doc, setDoc] = React.useState<unknown>(props.doc);
  const onChange = (patch: Operation[]) => {
    const result = applyPatch(doc, patch, {mutate: false});
    setDoc(result.doc);
  };
  return (
    <div style={{padding: '32px 64px'}}>
      <ClickableJson {...props} doc={doc} onChange={onChange} />
    </div>
  );
};

export const Interactive: StoryObj<typeof meta> = {
  render: () => <Demo doc={doc1} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const InteractiveEmpty: StoryObj<typeof meta> = {
  render: () => <Demo doc={null} />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const InteractiveLarge: StoryObj<typeof meta> = {
  render: () => <Demo doc={doc2} />,
  parameters: {
    layout: 'fullscreen',
  },
};

const pkg = {
  name: 'clickable-json',
  version: '0.0.1',
  description: 'Interactive JSON and JSON CRDT viewer and editor',
  author: {
    name: 'streamich',
    url: 'https://github.com/streamich',
  },
  homepage: 'https://github.com/streamich/clickable-json',
  repository: 'streamich/clickable-json',
  main: 'lib/index.js',
  types: 'lib/index.d.ts',
  typings: 'lib/index.d.ts',
  files: ['LICENSE', 'lib/'],
  scripts: {
    prettier: "prettier --ignore-path .gitignore --write 'src/**/*.{ts,tsx,js,jsx}'",
    'prettier:check': "prettier --ignore-path .gitignore --list-different 'src/**/*.{ts,tsx,js,jsx}'",
    lint: 'yarn eslint',
    'lint:fix': 'yarn eslint --fix',
    eslint: 'eslint src',
    clean: 'rimraf dist lib es6 es2019 es2020 esm typedocs storybook-static',
    build: 'tsc --project tsconfig.build.json',
    test: 'jest',
    test: 'yarn jest --maxWorkers 7',
    'test:all': 'yarn lint && yarn test',
    'test:ci': 'yarn jest --maxWorkers 3 --no-cache',
    storybook: 'storybook dev -p 6006',
    'storybook:build': 'storybook build',
    'storybook:publish': 'npx gh-pages -d storybook-static',
  },
  keywords: ['json', 'crdt', 'viewer', 'editor', 'tree', 'structured', 'react', 'json-crdt'],
  dependencies: {
    'json-joy': '^11.4.1',
    'nano-theme': '^1.2.0',
    'p4-ui': '^1.15.0',
  },
  peerDependencies: {
    react: '*',
    'react-dom': '*',
    tslib: '2',
  },
  devDependencies: {
    '@babel/preset-env': '^7.23.3',
    '@babel/preset-react': '^7.23.3',
    '@babel/preset-typescript': '^7.23.3',
    '@storybook/addon-essentials': '^7.5.3',
    '@storybook/addon-interactions': '^7.5.3',
    '@storybook/addon-links': '^7.5.3',
    '@storybook/addon-onboarding': '^1.0.8',
    '@storybook/addons': '^7.5.3',
    '@storybook/blocks': '^7.5.3',
    '@storybook/react': '^7.5.3',
    '@storybook/react-webpack5': '^7.5.3',
    '@storybook/testing-library': '^0.2.2',
    '@types/jest': '^29.5.9',
    '@types/react': '^18.2.38',
    '@typescript-eslint/eslint-plugin': '^6.12.0',
    '@typescript-eslint/parser': '^6.12.0',
    eslint: '^8.54.0',
    'eslint-plugin-react': '^7.33.2',
    'eslint-plugin-storybook': '^0.6.15',
    test: '^29.7.0',
    prettier: '^3.1.0',
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    rimraf: '^5.0.5',
    storybook: '^7.5.3',
    'ts-jest': '^29.1.1',
    tslib: '^2.6.2',
    typescript: '^5.3.2',
  },
  test: {
    verbose: true,
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.ts$': [
        'ts-jest',
        {
          useESM: true,
        },
      ],
    },
    transformIgnorePatterns: [],
    testRegex: '.*/(__tests__|__jest__|demo)/.*\\.(test|spec)\\.tsx?$',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
  },
  prettier: {
    arrowParens: 'always',
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    bracketSpacing: false,
  },
  eslintConfig: {
    extends: ['react-app', 'react-app/jest'],
  },
  config: {
    config: {
      commitizen: {
        path: 'git-cz',
      },
    },
  },
  packageManager: 'yarn@4.0.2',
};

export const Collapsed: StoryObj<typeof meta> = {
  render: () => <Demo doc={pkg} collapsed />,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Binary: StoryObj<typeof meta> = {
  render: () => <Demo doc={{foo: new Uint8Array([1, 2, 3])}} />,
  parameters: {
    layout: 'fullscreen',
  },
};
