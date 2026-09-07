import type {TemplatedApp} from './types';

// TODO: this has the defect `Http1Cors` fixes. It answers the preflight but
// sends no `Access-Control-Allow-Origin` on the real response, and it pairs
// `Allow-Credentials: true` with a wildcard origin, which browsers reject. The
// fix means writing the headers inside every `res.cork()` block of `RpcApp`:
// uWS has no place to set them before routing.
export const enableCors = (uws: TemplatedApp) => {
  const AccessControlAllowOrigin = Buffer.from('Access-Control-Allow-Origin');
  const AccessControlAllowOriginAllowAll = Buffer.from('*');
  const AccessControlAllowCredentials = Buffer.from('Access-Control-Allow-Credentials');
  const AccessControlAllowCredentialsTrue = Buffer.from('true');

  uws.options('/*', (res) => {
    res.cork(() => {
      res.writeHeader(AccessControlAllowOrigin, AccessControlAllowOriginAllowAll);
      res.writeHeader(AccessControlAllowCredentials, AccessControlAllowCredentialsTrue);
      res.end();
    });
  });
};
