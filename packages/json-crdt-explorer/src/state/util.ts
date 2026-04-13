export const stripExtensions = (filename: string): string => {
  if (filename.endsWith('.gz')) filename = filename.slice(0, -3);
  if (filename.endsWith('.json')) filename = filename.slice(0, -5);
  if (filename.endsWith('.njson')) filename = filename.slice(0, -6);
  if (filename.endsWith('.cbor')) filename = filename.slice(0, -5);
  if (filename.endsWith('.crdt')) filename = filename.slice(0, -5);
  if (filename.endsWith('.seq')) filename = filename.slice(0, -4);
  return filename;
};
