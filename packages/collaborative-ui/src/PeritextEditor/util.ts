export const getDomain = (url: string): string | undefined =>
  url.match(/^(?:[^:/]+:)?(?:\/{1,5})?(([^/$ .]+)\.([^/$ ]+))/i)?.[1];

export const parseUrl = (url: string): URL | undefined => {
  try {
    return new URL(url);
  } catch {
    return;
  }
};
