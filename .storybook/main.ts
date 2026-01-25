import type { StorybookConfig } from '@storybook/react-webpack5';

import { dirname, resolve } from "path"

import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
// List of packages that contain stories
const packages = [
  'collaborative-ace-react',
  'collaborative-codemirror',
  'collaborative-input',
  'collaborative-monaco-react',
  'collaborative-quill-react',
  'collaborative-str',
  'collaborative-ui',
  'json-joy',
  'ui',
];

const config: StorybookConfig = {
  "stories": packages.map(pkg => ({
    directory: `../packages/${pkg}/src`,
    files: '**/*.stories.@(js|jsx|mjs|ts|tsx)',
    titlePrefix: pkg,
  })),
  "addons": [
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc')
  ],
  "framework": getAbsolutePath('@storybook/react-webpack5'),
  typescript: {
    // Disable react-docgen to avoid parse errors on non-React TypeScript files
    // that use angle-bracket type assertions or JSDoc {@link} tags
    reactDocgen: false,
  },
  webpackFinal: async (config) => {
    // Resolve workspace package lib/* imports to src/* for development
    // This allows Storybook to work without building packages first
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Alias nice-ui to @jsonjoy.com/ui (nice-ui was migrated to @jsonjoy.com/ui)
      'nice-ui/lib': resolve(__dirname, '../packages/ui/src'),
      'nice-ui': resolve(__dirname, '../packages/ui/src'),
      '@jsonjoy.com/ui/lib': resolve(__dirname, '../packages/ui/src'),
      '@jsonjoy.com/ui': resolve(__dirname, '../packages/ui/src'),
      'json-joy/lib': resolve(__dirname, '../packages/json-joy/src'),
      '@jsonjoy.com/base64/lib': resolve(__dirname, '../packages/base64/src'),
      '@jsonjoy.com/buffers/lib': resolve(__dirname, '../packages/buffers/src'),
      '@jsonjoy.com/codegen/lib': resolve(__dirname, '../packages/codegen/src'),
      '@jsonjoy.com/collaborative-str/lib': resolve(__dirname, '../packages/collaborative-str/src'),
      '@jsonjoy.com/collaborative-str': resolve(__dirname, '../packages/collaborative-str/src'),
      '@jsonjoy.com/collaborative-ace/lib': resolve(__dirname, '../packages/collaborative-ace/src'),
      '@jsonjoy.com/collaborative-ace': resolve(__dirname, '../packages/collaborative-ace/src'),
      '@jsonjoy.com/collaborative-quill/lib': resolve(__dirname, '../packages/collaborative-quill/src'),
      '@jsonjoy.com/collaborative-quill': resolve(__dirname, '../packages/collaborative-quill/src'),
      '@jsonjoy.com/collaborative-monaco/lib': resolve(__dirname, '../packages/collaborative-monaco/src'),
      '@jsonjoy.com/collaborative-monaco': resolve(__dirname, '../packages/collaborative-monaco/src'),
      '@jsonjoy.com/json-expression/lib': resolve(__dirname, '../packages/json-expression/src'),
      '@jsonjoy.com/json-pack/lib': resolve(__dirname, '../packages/json-pack/src'),
      '@jsonjoy.com/json-path/lib': resolve(__dirname, '../packages/json-path/src'),
      '@jsonjoy.com/json-pointer/lib': resolve(__dirname, '../packages/json-pointer/src'),
      '@jsonjoy.com/json-pointer': resolve(__dirname, '../packages/json-pointer/src'),
      '@jsonjoy.com/json-random/lib': resolve(__dirname, '../packages/json-random/src'),
      '@jsonjoy.com/json-type/lib': resolve(__dirname, '../packages/json-type/src'),
      '@jsonjoy.com/util/lib': resolve(__dirname, '../packages/util/src'),
    };
    return config;
  },
};
export default config;