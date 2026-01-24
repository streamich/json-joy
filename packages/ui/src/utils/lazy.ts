import {createElement as h, Suspense, lazy as reactLazy, type ReactNode, type FC} from 'react';

const isClient = typeof window === 'object';

// eslint-disable-next-line
export const lazy = <P extends {}>(
  promiseGenerator: () => Promise<{default: React.ComponentType<P>}>,
  fallbackDefault = null,
): React.FC<P & {fallback?: any}> => {
  if (!isClient) return (() => fallbackDefault) as any;

  const Comp = reactLazy(promiseGenerator);
  const Result: FC<P & {fallback?: ReactNode}> = (props) => {
    const fallback = props.fallback || fallbackDefault;
    return h(Suspense, {fallback}, h(Comp, props as any));
  };

  return Result;
};
