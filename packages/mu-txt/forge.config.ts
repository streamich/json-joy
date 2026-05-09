import * as path from 'node:path';
import type {ForgeConfig} from '@electron-forge/shared-types';

const iconBase = path.join(__dirname, 'public', 'icons', 'icon-512');

const hasAppleIdentity = Boolean(process.env.APPLE_IDENTITY);
const hasAppleNotarize = Boolean(
  process.env.APPLE_ID && process.env.APPLE_PASSWORD && process.env.APPLE_TEAM_ID,
);

const config: ForgeConfig = {
  packagerConfig: {
    name: 'mu-txt',
    executableName: 'mutxt',
    appBundleId: 'com.mutxt',
    icon: iconBase,
    asar: true,
    // Registers `mutxt://` as a default scheme on macOS via Info.plist. On
    // Windows/Linux registration happens at runtime in main.ts.
    protocols: [{name: 'mu-txt', schemes: ['mutxt']}],
    osxSign: hasAppleIdentity
      ? {
          identity: process.env.APPLE_IDENTITY,
          optionsForFile: () => ({
            hardenedRuntime: true,
            entitlements: path.join(__dirname, 'electron', 'entitlements.plist'),
            'entitlements-inherit': path.join(__dirname, 'electron', 'entitlements.plist'),
          }),
        }
      : undefined,
    osxNotarize: hasAppleNotarize
      ? {
          appleId: process.env.APPLE_ID!,
          appleIdPassword: process.env.APPLE_PASSWORD!,
          teamId: process.env.APPLE_TEAM_ID!,
        }
      : undefined,
    win32metadata: {
      CompanyName: 'streamich',
      FileDescription: 'mu-txt',
      ProductName: 'mu-txt',
    },
    // Trim the packaged app to just the bits Electron needs at runtime:
    // dist/ (renderer), out-electron/ (main+preload), public/icons/ (window
    // icon), package.json. Everything else is build-time only.
    ignore: [
      /^\/src($|\/)/,
      /^\/electron($|\/)/,
      /^\/bin($|\/)/,
      /^\/docs($|\/)/,
      /^\/lib($|\/)/,
      /^\/out($|\/)/,
      /^\/public\/(?!icons($|\/))/,
      /^\/tsconfig.*\.json$/,
      /^\/webpack\.config\.ts$/,
      /^\/forge\.config\.ts$/,
      /^\/wrangler\.toml$/,
      /^\/SIGNING\.md$/,
      /^\/SECURITY\.md$/,
      /^\/README\.md$/,
      /\.map$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'mutxt',
        setupIcon: `${iconBase}.ico`,
      },
    },
    {name: '@electron-forge/maker-zip', config: {}, platforms: ['darwin', 'linux']},
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          mimeType: ['x-scheme-handler/mutxt'],
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          mimeType: ['x-scheme-handler/mutxt'],
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {owner: 'streamich', name: 'json-joy'},
        prerelease: false,
        draft: true,
      },
    },
  ],
};

export default config;
