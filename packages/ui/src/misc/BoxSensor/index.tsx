import * as React from 'react';

export type BoxDimensions = [x: number, y: number, width: number, height: number];

export interface SizeSensorProps extends React.AllHTMLAttributes<HTMLDivElement> {
  render: (box: BoxDimensions) => React.ReactNode;
  comp?: string;
}

export const BoxSensor: React.FC<SizeSensorProps> = ({render, comp, ...rest}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [box, setBox] = React.useState<BoxDimensions>([0, 0, 0, 0]);

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const updateBox = () => {
      const rect = el.getBoundingClientRect();
      setBox([rect.x, rect.y, rect.width, rect.height]);
    };
    updateBox();
    const resizeObserver = new ResizeObserver(updateBox);
    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return React.createElement(comp ?? 'div', {...rest, ref}, render(box));
};
