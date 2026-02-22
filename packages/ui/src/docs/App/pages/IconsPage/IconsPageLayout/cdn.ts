export interface NpmCdn {
  id: string;
  name: string;
  npm: string;
}

export const cdns: Map<string, NpmCdn> = new Map([
  [
    'jsdelivr',
    {
      id: 'jsdelivr',
      name: 'jsDelivr',
      npm: 'https://cdn.jsdelivr.net/npm/',
    },
  ],
  [
    'unpkg',
    {
      id: 'unpkg',
      name: 'UNPKG',
      npm: 'https://unpkg.com/',
    },
  ],
  [
    'esmsh',
    {
      id: 'esmsh',
      name: 'ESM.sh',
      npm: 'https://esm.sh/',
    },
  ],
]);
