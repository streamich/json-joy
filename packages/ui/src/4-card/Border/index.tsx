import * as React from 'react';
import {rule} from 'nano-theme';
import {useStyles} from '../../styles/context';

const blockClass = rule({
  pos: 'relative',
});

const borderLayerClass = rule({
  pos: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  bdrad: 'inherit',
  trs: 'opacity 220ms ease',
  mask: 'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
  WebkitMask: 'linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)',
  maskComposite: 'exclude',
  WebkitMaskComposite: 'xor',
});

export interface BorderProps {
  /** Border thickness in pixels. Default: 1. */
  thickness?: number;
  /** Radius of the bright spot in pixels. Default: 160. */
  radius?: number;
  /** Border-radius matching the wrapped content. Number (px) or any CSS length. */
  borderRadius?: number | string;
  /** Color of the bright spot following the cursor. Defaults to a high-contrast theme grey. */
  color?: string;
  /** Ambient (idle) border color visible when the cursor is away. */
  ambientColor?: string;
  /** Stretch the proximity area beyond the element bounds, in px. Default: 0. */
  reach?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Border: React.FC<BorderProps> = ({
  thickness = 1,
  radius = 160,
  borderRadius,
  color,
  ambientColor,
  reach = 0,
  className,
  style,
  children,
}) => {
  const styles = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const layerRef = React.useRef<HTMLDivElement>(null);
  const c = color ?? styles.g(0, 0.7);
  const a = ambientColor ?? styles.g(0, 0.12);

  React.useEffect(() => {
    if (!reach) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      const layer = layerRef.current;
      if (!el || !layer) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const within = x >= -reach && x <= rect.width + reach && y >= -reach && y <= rect.height + reach;
      layer.style.setProperty('--mx', x + 'px');
      layer.style.setProperty('--my', y + 'px');
      layer.style.opacity = within ? '1' : '';
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [reach]);

  const onMove = reach
    ? undefined
    : (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        const layer = layerRef.current;
        if (!el || !layer) return;
        const rect = el.getBoundingClientRect();
        layer.style.setProperty('--mx', e.clientX - rect.left + 'px');
        layer.style.setProperty('--my', e.clientY - rect.top + 'px');
      };

  const layerStyle: React.CSSProperties = {
    padding: thickness,
    background:
      `radial-gradient(circle ${radius}px at var(--mx, -9999px) var(--my, -9999px), ${c}, transparent 70%),` +
      `linear-gradient(${a}, ${a})`,
  };

  return (
    <div
      ref={ref}
      className={blockClass + (className ? ' ' + className : '')}
      style={{borderRadius, ...style}}
      onMouseMove={onMove}
    >
      <div ref={layerRef} className={borderLayerClass} style={layerStyle} />
      {children}
    </div>
  );
};
