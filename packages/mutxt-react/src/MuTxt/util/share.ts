import {encodeShareBlob, encodeEncryptedShareBlob} from './shareEncoding';

export const buildPlainShareUrl = (encoded: string): string => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = 'n=' + encoded;
  return url.toString();
};

export const buildShareUrl = (encoded: string, encrypted: boolean, title = '', message = ''): string => {
  const url = new URL(window.location.href);
  url.search = '';
  const params = new URLSearchParams();
  params.set(encrypted ? 'e' : 'n', encoded);
  if (title.trim()) params.set('t', title.trim());
  if (message.trim()) params.set('m', message.trim());
  url.hash = params.toString();
  return url.toString();
};

export const writeClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
};

export const copyDefaultShareLink = async (bytes: Uint8Array): Promise<string> => {
  const encoded = await encodeShareBlob(bytes);
  const url = buildPlainShareUrl(encoded);
  await writeClipboard(url);
  return url;
};

export {encodeShareBlob, encodeEncryptedShareBlob};
