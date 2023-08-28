import {ResolveType, TypeSystem} from '../../../../json-type';

export const system = new TypeSystem();
const t = system.t;

export const JsonRpc2Id = t.num.options({format: 'i32'});
system.alias('JsonRpc2Id', JsonRpc2Id);

export const JsonRpc2Notification = t.Object(
  t.prop('jsonrpc', t.Const(<const>'2.0')),
  t.prop('method', t.str),
  t.propOpt('params', t.any),
);
system.alias('JsonRpc2Notification', JsonRpc2Notification);

export const JsonRpc2Request = t.Object(
  t.prop('jsonrpc', t.Const(<const>'2.0')),
  t.prop('id', t.Ref<typeof JsonRpc2Id>('JsonRpc2Id')),
  t.prop(
    'method',
    t.str.options({
      title: 'RPC method name',
      description: 'JSON RPC 2.0 method name.',
    }),
  ),
  t.propOpt('params', t.any),
);
system.alias('JsonRpc2Request', JsonRpc2Request);

export const JsonRpc2Response = t.Object(
  t.prop('jsonrpc', t.Const(<const>'2.0')),
  t.prop('id', t.Ref<typeof JsonRpc2Id>('JsonRpc2Id')),
  t.prop('result', t.any),
);
system.alias('JsonRpc2Response', JsonRpc2Response);

export const JsonRpc2Error = t.Object(
  t.prop('jsonrpc', t.Const(<const>'2.0')),
  t.prop('id', t.Ref<typeof JsonRpc2Id>('JsonRpc2Id')),
  t.prop(
    'error',
    t.Object(
      t.prop(
        'message',
        t.str.options({
          title: 'Error message',
          description: 'A string providing a short description of the error.',
        }),
      ),
      t.prop(
        'code',
        t.num.options({
          title: 'Error code',
          description: 'A number that indicates the error type that occurred.',
          format: 'i32',
        }),
      ),
      t.propOpt(
        'data',
        t.any.options({
          title: 'Error data',
          description: 'A Primitive or Structured value that contains additional information about the error.',
        }),
      ),
    ),
  ),
);
system.alias('JsonRpc2Error', JsonRpc2Error);

// export const JsonRpc2BatchRequest = t.Array(
//   t.Or(
//     t.Ref<typeof JsonRpc2Request>('JsonRpc2Request'),
//     t.Ref<typeof JsonRpc2Notification>('JsonRpc2Notification'),
//   ).options({
//     discriminator: ['if', ['$?', ['=', '/method']], 0, 1],
//   }),
// );

// export const JsonRpc2BatchResponse = t.Array(
//   t.Or(
//     t.Ref<typeof JsonRpc2Response>('JsonRpc2Response'),
//     t.Ref<typeof JsonRpc2Error>('JsonRpc2Error'),
//   ).options({
//     discriminator: ['if', ['$?', ['=', '/result']], 0, 1],
//   }),
// );

// export const JsonRpc2PolymorphicRequest = t.Or(
//   t.Ref<typeof JsonRpc2Request>('JsonRpc2Request'),
//   t.Ref<typeof JsonRpc2Notification>('JsonRpc2Notification'),
//   t.Ref<typeof JsonRpc2BatchRequest>('JsonRpc2BatchRequest'),
// );

export type JsonRpc2NotificationMessage = ResolveType<typeof JsonRpc2Notification>;
export type JsonRpc2RequestMessage = ResolveType<typeof JsonRpc2Request>;
export type JsonRpc2ResponseMessage = ResolveType<typeof JsonRpc2Response>;
export type JsonRpc2ErrorMessage = ResolveType<typeof JsonRpc2Error>;
export type JsonRpc2Message =
  | JsonRpc2NotificationMessage
  | JsonRpc2RequestMessage
  | JsonRpc2ResponseMessage
  | JsonRpc2ErrorMessage;
