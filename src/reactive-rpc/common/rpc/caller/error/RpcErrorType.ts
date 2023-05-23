import {ResolveType, t} from '../../../../../json-type';

export const RpcErrorType = t
  .Object(
    t.prop('message', t.str).options({
      title: 'Error message',
      description: 'A human-readable error message.',
    }),
    t.propOpt('code', t.str.options({ascii: true})).options({
      title: 'Error code',
      description: 'A machine-readable fixed error code tag.',
    }),
    t.propOpt('errno', t.num).options({
      title: 'Error number',
      description: 'A machine-readable fixed error code number. Same as "code" but in numeric form.',
    }),
    t.propOpt('errorId', t.str.options({ascii: true})).options({
      title: 'Error ID',
      description:
        'Unique ID of the error as it is stored the system. Can be referenced to later to retrieve from storage.',
    }),
    t.propOpt('meta', t.any).options({
      title: 'Error metadata',
      description: 'Additional extra metadata.',
    }),
  )
  .options({
    title: 'RPC Error',
    encodeUnknownFields: false,
  });

export type IRpcError = ResolveType<typeof RpcErrorType>;
