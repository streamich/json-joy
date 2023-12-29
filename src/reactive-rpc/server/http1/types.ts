export interface ServerLogger {
  log(msg: unknown): void;
  error(kind: string, error?: Error | unknown | null, meta?: unknown): void;
}
