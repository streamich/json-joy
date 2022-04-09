/* tslint:disable no-string-literal */

import type {IncomingMessage} from 'http';
import {URL} from 'url';

export interface ConnectionContext {
  ip: string;
  token: string;
}

/**
 * Retrieves useful request information.
 *
 * Tries to retrieve IP address using the following methods in the that order:
 *
 * 1. Using `X-Forwarded-For` header.
 * 2. Using `X-Real-Ip` header.
 * 3. Using server IP address of the remote end.
 *
 * Tries to retrieve authentication token in multiple ways in the following
 * order:
 *
 * 1. Using `Authorization` header.
 * 2. Using `access_token` URL search param.
 * 3. Using `token` URL search param.
 * 4. Using `Sec-WebSocket-Protocol` header, as `X-Authorization=<base64 token>`
 *    sub-protocol.
 *
 * @param req uWebSockets.js request object
 * @param res uWebSockets.js response object
 * @returns Returns a processed context information.
 */
export const createConnectionContext = (req: IncomingMessage): ConnectionContext => {
  // Retrieve IP address.
  const ip =
    (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : '') ||
    (typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : '') ||
    req.socket.remoteAddress ||
    '';

  // Retrieve authentication token.
  let token: string = req.headers['authorization'] || '';
  if (!token && req.url) {
    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    token = params.get('access_token') || '';
    if (!token) token = params.get('token') || '';
  }

  // Try to retrieve authentication token from Sec-WebSocket-Protocol header.
  if (!token && typeof req.headers['sec-websocket-protocol'] === 'string') {
    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    if (secWebSocketProtocol) {
      const protocols = secWebSocketProtocol.split(',');
      const length = protocols.length;
      for (let i = 0; i < length; i++) {
        let protocol = protocols[i].trim();
        if (protocol.indexOf('X-Authorization=') === 0) {
          protocol = protocol.substring('X-Authorization='.length);
          if (protocol) {
            token = Buffer.from(protocol).toString('base64');
            break;
          }
        }
      }
    }
  }

  return {ip, token};
};
