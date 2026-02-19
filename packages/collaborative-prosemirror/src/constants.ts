import {PluginKey} from 'prosemirror-state';

export const SYNC_PLUGIN_KEY = new PluginKey<{}>('jsonjoy.com/json-crdt/sync');

export enum TransactionOrigin {
  UNKNOWN,
  LOCAL,
  REMOTE,
}
