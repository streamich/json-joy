import type {ConnectionContext} from '../../reactive-rpc/server/context';
import type {Services} from './Services';

export type MyCtx = ConnectionContext<{services: Services}>;
