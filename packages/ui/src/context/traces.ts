import {createContext, useContext, FC, createElement as h, useMemo} from 'react';

export interface NamedTraceContextValue {
  /** Whether elements in this render subtree are hidden - should not be
   * visible to the user on the screen. */
  hidden?: boolean;
}

export interface TraceContextValue extends NamedTraceContextValue {
  [key: string]: unknown;
}

export const ctx = createContext<TraceContextValue>({});
export const useTrace = <V>(key: string): V | undefined =>
  useContext(ctx)[key] as V | undefined;

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
  const value = useMemo(() => ({...parentValue, ..._value}), [...Object.entries(_value).flat(), parentValue]);

  return h(ctx.Provider, {value, children});
};

// ------------------------------------------------------------ Specific traces

export const useHiddenTrace = (): boolean => !!useTrace('hidden');
