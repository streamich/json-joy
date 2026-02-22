import type {TransactionOrigin} from '../constants';

export interface SyncPluginTransactionMeta {
  orig?: TransactionOrigin;
}
