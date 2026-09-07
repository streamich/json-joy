import * as React from 'react';
import type {ViewProjection} from '../../types/ViewProjection';

/**
 * The **external field** contract. `@jsonjoy.com/ui` implements only scalar
 * fields; every entity/complex field (Person, Status, Tags, File, relations) is
 * an `external` field whose rendering the host supplies through this interface.
 */
export interface ExternalFieldViewProps {
  value: unknown;
  config?: unknown;
  projection?: ViewProjection;
}

export interface ExternalFieldControlProps {
  value: unknown;
  onChange: (value: unknown) => void;
  /** Pane-level submit (Enter / Apply). */
  onSubmit?: () => void;
  focus?: boolean;
  config?: unknown;
}

export interface ExternalFieldEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
  /** Close the reveal popover (value already committed via `onChange`). */
  onCommit: () => void;
  config?: unknown;
}

export interface ExternalFieldRenderer {
  /** Read-only display (the `chip` capability). */
  view: (props: ExternalFieldViewProps) => React.ReactNode;
  /** Compact inline editor for menu / `live` mode (the `inline` capability). */
  control: (props: ExternalFieldControlProps) => React.ReactNode;
  /** Rich reveal editor for the popover (the `editor` capability). Falls back to {@link control} when absent. */
  editor?: (props: ExternalFieldEditorProps) => React.ReactNode;
  /** Whether the value counts as empty (drives the "Empty" placeholder). */
  isEmpty?: (value: unknown) => boolean;
}

export interface ExternalFieldRegistry {
  get(type: string): ExternalFieldRenderer | undefined;
}

const ctx = React.createContext<ExternalFieldRegistry | null>(null);

export interface ExternalFieldRegistryProviderProps {
  /** Either a registry object with a `get(type)`, or a plain `type -> renderer` map. */
  registry: ExternalFieldRegistry | Record<string, ExternalFieldRenderer>;
  children: React.ReactNode;
}

export const ExternalFieldRegistryProvider: React.FC<ExternalFieldRegistryProviderProps> = ({registry, children}) => {
  const value = React.useMemo<ExternalFieldRegistry>(() => {
    if (typeof (registry as ExternalFieldRegistry).get === 'function') return registry as ExternalFieldRegistry;
    const map = registry as Record<string, ExternalFieldRenderer>;
    return {get: (type: string) => map[type]};
  }, [registry]);
  return <ctx.Provider value={value}>{children}</ctx.Provider>;
};

export const useExternalFieldRenderer = (type?: string): ExternalFieldRenderer | undefined => {
  const registry = React.useContext(ctx);
  return type && registry ? registry.get(type) : undefined;
};

const unwrap = (v: unknown): unknown =>
  v && typeof v === 'object' && 'value' in (v as Record<string, unknown>) ? (v as {value: unknown}).value : v;

/** Read-only display for an external field whose renderer is not registered. */
export const ExternalFieldFallback: React.FC<{value: unknown}> = ({value}) => {
  const v = unwrap(value);
  return <span>{v === undefined || v === null ? '' : String(v)}</span>;
};
