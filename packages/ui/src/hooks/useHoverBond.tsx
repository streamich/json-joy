import * as React from 'react';
import useMountedState from 'react-use/lib/useMountedState';

const {useState, useMemo} = React;

export interface HoverBond {
  onMouseEnter: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
}

export const useHoverBond = (): [boolean, HoverBond] => {
  const isMounted = useMountedState();
  const [state, setState] = useState<boolean>(false);
  const bond: HoverBond = useMemo(
    () =>
      ({
        onMouseEnter: () => {
          if (!isMounted()) return;
          setState(true);
        },
        onMouseLeave: () => {
          if (!isMounted()) return;
          setState(false);
        },
      }) as HoverBond,
    [],
  );

  return [state, bond];
};
