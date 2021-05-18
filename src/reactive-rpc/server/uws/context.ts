import type {HttpRequest, HttpResponse} from 'uWebSockets.js';

export interface ConnectionContext {
  ip: string;
  token: string;
}

export interface RequestContext extends ConnectionContext {
  size: number;
}

export const createConnectionContext = (req: HttpRequest, res: HttpResponse): ConnectionContext => {
  const ip =
    req.getHeader('x-forwarded-for') ||
    req.getHeader('x-real-ip') ||
    Buffer.from(res.getRemoteAddressAsText()).toString('utf8');
  let token: string = req.getHeader('authorization') || '';
  if (!token) {
    const query = req.getQuery();
    const params = new URLSearchParams(query);
    token = params.get('access_token') || '';
  }
  return {ip, token};
};
