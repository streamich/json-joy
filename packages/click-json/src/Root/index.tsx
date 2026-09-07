import {rule} from 'nano-theme';
import * as React from 'react';
import useClickAway from 'react-use/lib/useClickAway';
import useMountedState from 'react-use/lib/useMountedState';
import {useFocus} from '../context/focus';
import {InputProvider} from '../context/input';
import {useStyles} from '../context/style';

const blockClass = rule({
  d: 'inline-block',
  ff: 'monospace',
});

export interface RootProps {
  children: React.ReactNode;
  onFocus?: (pointer: string | null) => void;
  /** Extra inline styles merged onto the root element (e.g. theme CSS variables). */
  style?: React.CSSProperties;
}

export const Root: React.FC<RootProps> = ({children, onFocus, style}) => {
  const isMounted = useMountedState();
  const styles = useStyles();
  const {focused, focus, point} = useFocus();
  const ref = React.useRef(null);
  const focusRef = React.useRef(focused);
  useClickAway(ref, () => {
    if (!isMounted) return;
    point(null);
    focus(null);
  });

  if (onFocus && focused !== focusRef.current) {
    focusRef.current = focused;
    onFocus(focused);
  }

  return (
    <InputProvider>
      <span ref={ref} className={blockClass} style={{fontSize: styles.fontSize || '13.4px', ...style}}>
        {children}
      </span>
    </InputProvider>
  );
};
