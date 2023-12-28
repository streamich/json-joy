import {PayloadTooLarge} from './errors';
import type * as http from 'http';

export const getBody = (request: http.IncomingMessage, max: number): Promise<Buffer[]> => {
  return new Promise<Buffer[]>((resolve, reject) => {
    let size: number = 0;
    const chunks: Buffer[] = [];
    request.on('error', (error) => {
      request.removeAllListeners();
      reject(error);
    });
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > max) {
        request.removeAllListeners();
        reject(new PayloadTooLarge());
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      // request.removeAllListeners();
      resolve(chunks);
    });
  });
};

const REGEX_AUTH_TOKEN_SPECIFIER = /tkn\.([a-zA-Z0-9\-_]+)(?:[^a-zA-Z0-9\-_]|$)/;

export const findTokenInText = (text: string): string => {
  const match = REGEX_AUTH_TOKEN_SPECIFIER.exec(text);
  if (!match) return '';
  return match[1] || '';
};
