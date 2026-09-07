/**
 * @module
 * Atomic values that can be set and overwritten which trace through the render tree. Can be used with common props, such as:
 *
 * - Accent color
 * - Background color
 * - Border roundness
 * - Disabled/read-only state
 * - Roundness (e.g. for card/button borders)
 * - etc.
 */

import {createContext, useContext, type FC, createElement as h, useMemo} from 'react';

export interface NamedTraceContextValue {
  /** Whether elements in this render subtree are hidden - should not be
   * visible to the user on the screen. */
  hidden?: boolean;

  /**
   * A variant of a UI component with less clutter, reduced decoration noise,
   * thinner separators, less background colors, less "in your face" styling.
   * This is typically used when the component is rendered in a context where
   * space is limited, such as a toolbar or a dropdown menu, or when UI is
   * already busy.
   */
  subtle?: boolean;

  /**
   * Roundness level in `[0.0, 1.0]` range. The exact mapping to border-radius
   * is up to the component.
   */
  roundness?: number;

  /**
   * Vertical rhythm / element sizing in `[0.0, 1.0]` range. Higher is roomier
   * (more padding, larger controls); lower is tighter. The exact mapping to
   * padding/size is up to the component.
   */
  spacing?: number;

  /**
   * Information density in `[0.0, 1.0]` range. Higher reveals more — full inline
   * editors plus secondary info (units, descriptions, manage affordances); lower
   * collapses toward terse / view-only. A continuous generalization of
   * `subtle`. The exact behavior is up to the component.
   */
  detail?: number;
}

export interface TraceContextValue extends NamedTraceContextValue {
  [key: string]: unknown;
}

export const ctx = createContext<TraceContextValue>({});
export const useTrace = <V>(key: string): V | undefined => useContext(ctx)[key] as V | undefined;

export interface SetTraceProps {
  name: keyof TraceContextValue;
  value: unknown;
  children: React.ReactNode;
}

export const SetTrace: FC<SetTraceProps> = ({children, name, value: _value}) => {
  const parentValue = useContext(ctx);
  const value = useMemo(() => ({...parentValue, [name]: _value}), [name, _value, parentValue]);
  return h(ctx.Provider, {value, children});
};

export interface SetNamedTraceProps<K extends keyof NamedTraceContextValue> {
  name: K;
  value: NamedTraceContextValue[K];
  children: React.ReactNode;
}

export const SetNamedTrace: <K extends keyof NamedTraceContextValue>(props: SetNamedTraceProps<K>) => React.ReactNode =
  SetTrace as any;

export interface SetTracesProps {
  value: TraceContextValue;
  children: React.ReactNode;
}

export const SetTraces: FC<SetTracesProps> = ({children, value: _value}) => {
  const parentValue = useContext(ctx);
  // biome-ignore lint/correctness/useExhaustiveDependencies: _value entries are spread into deps to track its keys/values individually
  const value = useMemo(() => ({...parentValue, ..._value}), [...Object.entries(_value).flat(), parentValue]);

  return h(ctx.Provider, {value, children});
};

// ------------------------------------------------------------ Specific traces

export const useHiddenTrace = (): boolean => !!useTrace('hidden');
export const useSubtleTrace = (): boolean => !!useTrace('subtle');
export const useRoundnessTrace = (roundness: number): number | undefined => useTrace('roundness') ?? roundness;
export const useSpacingTrace = (spacing: number): number => useTrace<number>('spacing') ?? spacing;
export const useDetailTrace = (detail: number): number => useTrace<number>('detail') ?? detail;
