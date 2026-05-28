import * as React from 'react';
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';
import type {EditSession} from '@jsonjoy.com/json-crdt-repo/lib/session/EditSession';
import type {Model, NodeBuilder} from 'json-joy/lib/json-crdt';

export interface LiveCrdtProps {
  /** Document ID used in the repo and on the server. */
  id: string;

  /** Optional default schema for new documents. */
  schema?: NodeBuilder;

  /**
   * WebSocket URL of the JSON CRDT server.
   * Defaults to the public demo server.
   */
  wsUrl?: string;

  /**
   * IndexedDB database name for local persistence.
   * Defaults to `'json-crdt-repo'`.
   */
  name?: string;

  /**
   * Time in ms to wait for the server when neither the local repo nor the
   * remote has the block yet, before falling back to creating a fresh local
   * block via `make`. Default `3000`.
   */
  remoteTimeout?: number;

  /**
   * Called once after the session is created. Use to register extensions
   * or perform other one-time model setup.
   */
  setup?: (model: Model<any>, session: EditSession) => void;

  /** Rendered while the session is being loaded. */
  loading?: React.ReactNode;

  /** Render the document model. Called on every model tick. */
  children: (model: Model<any>, session: EditSession, repo: JsonCrdtRepo) => React.ReactNode;
}

const repos = new Map<string, JsonCrdtRepo>();

const getRepo = (name: string, wsUrl: string): JsonCrdtRepo => {
  const key = `${name}\0${wsUrl}`;
  let repo = repos.get(key);
  if (!repo) {
    repo = new JsonCrdtRepo({name, wsUrl});
    repos.set(key, repo);
  }
  return repo;
};

export const LiveCrdt: React.FC<LiveCrdtProps> = ({
  id,
  schema,
  setup,
  wsUrl = 'wss://pub-1-api.jsonjoy.org/rx',
  name = 'json-crdt-repo',
  remoteTimeout = 3000,
  loading = null,
  children,
}) => {
  const repo = React.useMemo(() => getRepo(name, wsUrl), [name, wsUrl]);
  const [session, setSession] = React.useState<EditSession | null>(null);

  React.useEffect(() => {
    let disposed = false;
    let created: EditSession | null = null;
    (async () => {
      try {
        const s = await repo.sessions.load({
          id: ['default', id],
          remote: {timeout: remoteTimeout},
          make: schema ? {schema} : {},
        });
        if (disposed) {
          s.dispose();
          return;
        }
        setup?.(s.model, s);
        created = s;
        setSession(s);
      } catch (err) {
        // Surfacing the error here would only be useful if `loading` was
        // replaced with an error UI — left to the integration if needed.
        console.error('LiveCrdt: failed to load session', err);
      }
    })();
    return () => {
      disposed = true;
      created?.dispose();
      setSession(null);
    };
  }, [repo, id, remoteTimeout]);

  if (!session) return <>{loading}</>;
  return <LiveCrdtInner session={session} repo={repo}>{children}</LiveCrdtInner>;
};

const LiveCrdtInner: React.FC<{
  session: EditSession;
  repo: JsonCrdtRepo;
  children: (model: Model<any>, session: EditSession, repo: JsonCrdtRepo) => React.ReactNode;
}> = ({session, repo, children}) => {
  const model = session.model;
  const getSnapshot = React.useCallback(() => model.tick, [model]);
  const tick = React.useSyncExternalStore(model.api.subscribe, getSnapshot);

  return <>{children(model, session, repo)}</>;
};
