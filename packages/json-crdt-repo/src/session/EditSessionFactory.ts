import {Model, type NodeBuilder} from 'json-joy/lib/json-crdt';
import type {BlockId, LocalRepo} from '../local/types';
import {EditSession} from './EditSession';
import {timeout} from 'thingies/lib/timeout';

export interface EditSessionFactoryOpts {
  readonly sid: number;
  readonly repo: LocalRepo;
}

export class EditSessionFactory {
  constructor(protected readonly opts: EditSessionFactoryOpts) {}

  /**
   * Creates a new editing session synchronously (immediately). If the block
   * with a given ID already exists, it asynchronously synchronizes the local
   * and remote state.
   */
  public make(opts: EditSessionMakeOpts): {session: EditSession; sync?: Promise<void>} {
    const {id, schema, pull = true} = opts;
    const factoryOpts = this.opts;
    const model = Model.create(void 0, factoryOpts.sid);
    const session = new EditSession(factoryOpts.repo, id, model, undefined, opts.session);
    if (schema) {
      const sessionModel = session.model;
      sessionModel.setSchema(schema);
      sessionModel.api.flush();
    }
    let sync: Promise<void> | undefined;
    if (pull) {
      sync = session
        .sync()
        .then(() => {})
        .catch(() => {});
    }
    session.log.end.api.autoFlush();
    return {session, sync};
  }

  /**
   * Load block from the local repo. Creates a new editing session
   * asynchronously from an existing local block.
   *
   * It is also possible to block on remote state check in case the block does
   * not exist locally. When `pull` is set, it will also refresh the latest
   * state from the remote in the background after returning local state.
   */
  public async load(opts: EditSessionLoadOpts): Promise<EditSession> {
    const id = opts.id;
    const repo = this.opts.repo;
    try {
      const {model, cursor} = await repo.get({id});
      const session = new EditSession(repo, id, model, cursor, opts.session);
      session.log.end.api.autoFlush();
      if (opts.pull) {
        void repo
          .pull(id)
          .then(async ({cursor}) => {
            session.cursor = cursor;
            await session.load();
          })
          .catch(() => {});
      }
      return session;
    } catch (error) {
      const errorCode =
        error && typeof error === 'object'
          ? (error as Record<string, unknown>).code || (error as Record<string, unknown>).message || ''
          : '';
      if (errorCode === 'NOT_FOUND') {
        const remote = opts.remote;
        if (remote) {
          const timeoutMs = remote.timeout;
          try {
            const {model, cursor} = await (typeof timeoutMs === 'number'
              ? timeout(timeoutMs, repo.pull(id))
              : repo.pull(id));
            if (remote.throwIf === 'exists') throw new Error('EXISTS');
            const session = new EditSession(repo, id, model, cursor, opts.session);
            session.log.end.api.autoFlush();
            return session;
          } catch (error) {
            const errorCode =
              error && typeof error === 'object'
                ? (error as Record<string, unknown>).code || (error as Record<string, unknown>).message || ''
                : '';
            switch (errorCode) {
              case 'TIMEOUT': {
                if (!opts.make) throw error;
                break;
              }
              case 'NOT_FOUND': {
                if (remote.throwIf === 'missing') throw error;
                break;
              }
              default: {
                throw error;
              }
            }
          }
        }
        if (opts.make) return this.make({session: opts.session, ...opts.make, id}).session;
      }
      throw error;
    }
  }
}

/**
 * Constructs a new editing session synchronously.
 */
export interface EditSessionMakeOpts {
  /** Block ID. */
  id: BlockId;

  /** The new block schema, if any. */
  schema?: NodeBuilder;

  /**
   * Whether to asynchronously pull for any existing local block state, if a
   * block with the same ID already exists. Defaults to `true`.
   */
  pull?: boolean;

  /**
   * Internal unique session ID.
   */
  session?: number;
}

/**
 * Constructs and editing session asynchronously from an existing block. In
 * case the block does not exist, it is possible to create one or throw an
 * error.
 */
export interface EditSessionLoadOpts {
  /** Block ID. */
  id: BlockId;

  /**
   * If specified, will create a new block, if one does not already exist. Will
   * use these `make` options and provide them to the `make()` call.
   */
  make?: Omit<EditSessionMakeOpts, 'id'>;

  // /** The new block schema, if any. */
  // schema?: NodeBuilder;

  /**
   * Internal unique session ID.
   */
  session?: number;

  /**
   * Whether to refresh the latest state from the remote in the background
   * after loading an existing local block.
   */
  pull?: boolean;

  remote?: {
    /**
     * Time in milliseconds to wait for the remote to respond. If the remote
     * does not respond in time, the call will proceed with the local state.
     *
     * If upsert `make` option is not provided, the call will throw a "TIMEOUT"
     * error.
     */
    timeout?: number;

    /**
     * Defaults to an empty string. Otherwise, if "missing", will throw a
     * "NOT_FOUND" error if the block does not exist remotely. If "exists", will
     * a "CONFLICT" error if the block exists remotely.
     */
    throwIf?: '' | 'missing' | 'exists';
  };
}
