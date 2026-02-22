import * as React from 'react';

export interface Props {
  scroll: boolean;
  children: React.ReactNode;
}

export const ScrollToView: React.FC<Props> = ({scroll, children}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!scroll) return;
    if (!ref.current) return;
    const el = ref.current;
    const rect1 = el.getBoundingClientRect();
    const rect2 = el.parentElement!.getBoundingClientRect();
    if (rect1.y + rect1.height < rect2.y + 16 || rect1.y > rect2.y + rect2.height - 16) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }, [scroll]);

  return <div ref={ref as any}>{children}</div>;
};
