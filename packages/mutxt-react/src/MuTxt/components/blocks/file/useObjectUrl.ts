import * as React from 'react';

const cache = new WeakMap<Uint8Array, string>();
const registry =
  typeof FinalizationRegistry !== 'undefined'
    ? new FinalizationRegistry<string>((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      })
    : null;

const create = (data: Uint8Array, mime?: string): string | null => {
  try {
    const blob = new Blob([data as BlobPart], {type: mime || 'application/octet-stream'});
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

const get = (data: Uint8Array, mime?: string): string | null => {
  const cached = cache.get(data);
  if (cached) return cached;
  const url = create(data, mime);
  if (!url) return null;
  cache.set(data, url);
  registry?.register(data, url);
  return url;
};

export const useObjectUrl = (data: Uint8Array | undefined, mime: string | undefined): string | null =>
  React.useMemo(() => (data && data.length ? get(data, mime) : null), [data, mime]);
