import * as React from 'react';
import type {Rect} from '../../../types';

export type SetRect = (rect?: Rect) => void;

export interface CharOverlayProps extends React.HTMLAttributes<HTMLSpanElement> {
  rectRef: React.RefObject<SetRect | null>;
}

export const CharOverlay: React.FC<CharOverlayProps> = ({rectRef, ...rest}) => {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  React.useEffect(() => {
    (rectRef as any).current = (rect?: Rect) => {
      const span = ref.current;
      if (!span) return;
      const style = span.style;
      if (rect) {
        style.top = rect.y + 'px';
        style.left = rect.x + 'px';
        style.width = rect.width + 'px';
        style.height = rect.height + 'px';
        style.visibility = 'visible';
      } else {
        style.visibility = 'hidden';
      }
    };
  }, []);

  return <span {...rest} ref={ref} />;
};
