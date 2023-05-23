import {sampleApi} from '../../reactive-rpc/common/rpc/__tests__/api';
import {RpcMethodRequest, RpcMethodResponse} from '../../reactive-rpc/common/rpc/types';

type AuthGetUserRequest = RpcMethodRequest<(typeof sampleApi)['auth.users.get']>;
type AuthGetUserResponse = RpcMethodResponse<(typeof sampleApi)['auth.users.get']>;
