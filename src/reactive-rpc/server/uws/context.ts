import type {HttpRequest, HttpResponse} from 'uWebSockets.js';

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
export const createConnectionContext = (req: HttpRequest, res: HttpResponse): ConnectionContext => {
  // Retrieve IP address.
  const ip =
    req.getHeader('x-forwarded-for') ||
    req.getHeader('x-real-ip') ||
    Buffer.from(res.getRemoteAddressAsText()).toString('utf8');

  // Retrieve authentication token.
  let token: string = req.getHeader('authorization') || '';
  if (!token) {
    const query = req.getQuery();
    const params = new URLSearchParams(query);
    token = params.get('access_token') || '';
    if (!token) params.get('token') || '';
  }
  if (!token) {
    const secWebSocketProtocol = String(req.getHeader('sec-websocket-protocol')) || '';
    const protocols = secWebSocketProtocol.split(',');
    const length = protocols.length;
    for (let i = 0; i < length; i++) {
      let protocol = protocols[i].trim();
      if (protocol.indexOf('X-Authorization=') === 0) {
        protocol = protocol.substr('X-Authorization='.length);
        if (protocol) {
          token = Buffer.from(protocol).toString('base64');
          break;
        }
      }
    }
  }

  return {ip, token};
};
