import type {TemplatedApp} from './types';

export const enableCors = (uws: TemplatedApp) => {
  const AccessControlAllowOrigin = Buffer.from('Access-Control-Allow-Origin');
  const AccessControlAllowOriginAllowAll = Buffer.from('*');
  const AccessControlAllowCredentials = Buffer.from('Access-Control-Allow-Credentials');
  const AccessControlAllowCredentialsTrue = Buffer.from('true');

  uws.options('/*', (res, req) => {
    res.cork(() => {
      res.writeHeader(AccessControlAllowOrigin, AccessControlAllowOriginAllowAll);
      res.writeHeader(AccessControlAllowCredentials, AccessControlAllowCredentialsTrue);
      res.end();
    });
  });
};
