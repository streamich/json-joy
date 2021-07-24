export interface UwsApp {
  options(route: string, handler: (
    res: {
      writeHeader(key: string | Buffer, value: string | Buffer): void;
      cork(cb: () => void): void;
      end(): void;
    },
    req: {},
  ) => void): void;
}

export const enableCors = (uws: UwsApp) => {
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
