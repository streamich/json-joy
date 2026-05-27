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
   * Called once after the session is created. Use to register extensions
   * or perform other one-time model setup.
   */
  setup?: (model: Model<any>, session: EditSession) => void;

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
  children,
}) => {
  const repo = React.useMemo(() => getRepo(name, wsUrl), [name, wsUrl]);

  const sessionRef = React.useRef<EditSession | null>(null);

  if (!sessionRef.current || (sessionRef.current as any)._stopped) {
    const {session} = repo.sessions.make({
      id: ['default', id],
      schema,
    });
    setup?.(session.model, session);
    sessionRef.current = session;
  }

  const session = sessionRef.current;

  React.useEffect(() => {
    return () => {
      session.dispose();
    };
  }, [session]);

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
