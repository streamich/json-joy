import {PayloadTooLarge} from './errors';
import type {ConnectionContext} from './context';
import type * as http from 'http';
import type {RpcCodecs} from '../../common/codec/RpcCodecs';

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

const REGEX_CODECS_SPECIFIER = /rpc\.(\w{0,32})\.(\w{0,32})\.(\w{0,32})(?:\-(\w{0,32}))?/;

/**
 * @param specifier A string which may contain a codec specifier. For example:
 *  - `rpc.rx.compact.cbor` for Rx-RPC with compact messages and CBOR values.
 *  - `rpc.json2.verbose.json` for JSON-RPC 2.0 with verbose messages encoded as JSON.
 */
export const setCodecs = (ctx: ConnectionContext, specifier: string, codecs: RpcCodecs): void => {
  const match = REGEX_CODECS_SPECIFIER.exec(specifier);
  if (!match) return;
  const [, protocol, messageFormat, request, response] = match;
  switch (protocol) {
    case 'rx': {
      switch (messageFormat) {
        case 'compact': {
          ctx.msgCodec = codecs.messages.compact;
          break;
        }
        case 'binary': {
          ctx.msgCodec = codecs.messages.binary;
          break;
        }
      }
      break;
    }
    case 'json2': {
      ctx.msgCodec = codecs.messages.jsonRpc2;
      break;
    }
  }
  switch (request) {
    case 'cbor': {
      ctx.resCodec = ctx.reqCodec = codecs.value.cbor;
      break;
    }
    case 'json': {
      ctx.resCodec = ctx.reqCodec = codecs.value.json;
      break;
    }
    case 'msgpack': {
      ctx.resCodec = ctx.reqCodec = codecs.value.msgpack;
      break;
    }
  }
  switch (response) {
    case 'cbor': {
      ctx.resCodec = codecs.value.cbor;
      break;
    }
    case 'json': {
      ctx.resCodec = codecs.value.json;
      break;
    }
    case 'msgpack': {
      ctx.resCodec = codecs.value.msgpack;
      break;
    }
  }
};
