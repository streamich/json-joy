import * as React from 'react';
import {keyframes, rule} from 'nano-theme';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const idleAnimation = keyframes({
  from: {
    transform: 'translateY(0px) scale(1)',
  },
  '50%': {
    transform: 'translateY(-1px) scale(1.01)',
  },
  to: {
    transform: 'translateY(0px) scale(1)',
  },
});

const hoverAnimation = keyframes({
  from: {
    transform: 'translateY(0px) scale(1.03)',
  },
  '40%': {
    transform: 'translateY(-1.4px) scale(1.08, 1.03)',
  },
  to: {
    transform: 'translateY(0px) scale(1.06)',
  },
});

const blinkAnimation = keyframes({
  '0%, 92%, 100%': {
    transform: 'scaleY(1)',
  },
  '94%': {
    transform: 'scaleY(0.08)',
  },
  '96%': {
    transform: 'scaleY(1)',
  },
});

const wrapClass = rule(
  {
    pos: 'relative',
    d: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    lineHeight: 0,
    userSelect: 'none',
    flex: '0 0 auto',
    svg: {
      d: 'block',
      ov: 'visible',
    },
    '.blob-shell': {
      transformOrigin: '50% 50%',
      transformBox: 'fill-box',
    },
    '.eye-blink': {
      transformOrigin: '50% 50%',
      transformBox: 'fill-box',
    },
  },
  'BlobFace',
);

export interface BlobFaceProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export const BlobFace: React.FC<BlobFaceProps> = ({
  size = 28,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
  title,
  ...rest
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const lookStateRef = React.useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    renderedX: 0,
    renderedY: 0,
    rafId: 0,
  });
  const [hovered, setHovered] = React.useState(false);
  const [look, setLook] = React.useState({x: 0, y: 0});

  React.useEffect(() => {
    const state = lookStateRef.current;
    const maxDistance = 600;

    const tick = () => {
      const s = lookStateRef.current;
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;

      s.x += dx * 0.12;
      s.y += dy * 0.12;

      const settled = Math.abs(dx) < 0.02 && Math.abs(dy) < 0.02;
      if (settled) {
        s.x = s.tx;
        s.y = s.ty;
      }

      const nextX = Number(s.x.toFixed(2));
      const nextY = Number(s.y.toFixed(2));
      if (nextX !== s.renderedX || nextY !== s.renderedY) {
        s.renderedX = nextX;
        s.renderedY = nextY;
        setLook((prev) => (prev.x === nextX && prev.y === nextY ? prev : {x: nextX, y: nextY}));
      }

      s.rafId = settled ? 0 : requestAnimationFrame(tick);
    };

    const queueTick = () => {
      if (state.rafId === 0) state.rafId = requestAnimationFrame(tick);
    };

    const resetLook = () => {
      state.tx = 0;
      state.ty = 0;
      queueTick();
    };

    const onMove = (event: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      const reach = clamp(distance / maxDistance, 0, 1);
      const easedReach = 1 - (1 - reach) * (1 - reach);
      const directionX = distance > 0.001 ? dx / distance : 0;
      const directionY = distance > 0.001 ? dy / distance : 0;

      state.tx = Number(clamp(directionX * 10.4 * easedReach, -10.4, 10.4).toFixed(2));
      state.ty = Number(clamp(directionY * 7.6 * easedReach, -7.6, 7.6).toFixed(2));
      queueTick();
    };

    const onMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) resetLook();
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('blur', resetLook);
    window.addEventListener('mouseout', onMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('blur', resetLook);
      window.removeEventListener('mouseout', onMouseOut);
      if (state.rafId) cancelAnimationFrame(state.rafId);
    };
  }, []);

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      setHovered(true);
      onMouseEnter?.(event);
    },
    [onMouseEnter],
  );

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      setHovered(false);
      onMouseLeave?.(event);
    },
    [onMouseLeave],
  );

  const interactive = typeof onClick === 'function';
  const rootStyle: React.CSSProperties = {width: size, height: size, ...style};
  if (interactive && !rootStyle.cursor) rootStyle.cursor = 'pointer';

  const bodyAnimation = hovered ? `${hoverAnimation} 900ms ease-in-out infinite` : `${idleAnimation} 3200ms ease-in-out infinite`;
  const eyeWidth = hovered ? 9.4 : 5.2;
  const eyeHeight = hovered ? 4.4 : 10.6;
  const eyeRadius = hovered ? 1.2 : 1.1;
  const eyeOffset = hovered ? 5.4 : 4.5;
  const eyeTopWidth = eyeWidth + 0.9;
  const eyeBottomWidth = eyeWidth - 0.6;
  const leftEyePulse = hovered ? '1 1;1 1;1.08 0.94;1 1;1 1' : '1 1;1 1;1.08 1.12;1 1;1 1';
  const rightEyePulse = hovered ? '1 1;1 1;1.05 0.92;1 1;1 1' : '1 1;1 1;1.05 1.1;1 1;1 1';

  const renderEye = () => {
    if (hovered) {
      return <rect x={-eyeWidth / 2} y={-eyeHeight / 2} width={eyeWidth} height={eyeHeight} rx={eyeRadius} fill="#fff" />;
    }

    return (
      <path
        d={`M ${(-eyeTopWidth / 2).toFixed(2)} ${(-eyeHeight / 2).toFixed(2)} L ${(eyeTopWidth / 2).toFixed(2)} ${(-eyeHeight / 2).toFixed(2)} L ${(eyeBottomWidth / 2).toFixed(2)} ${(eyeHeight / 2).toFixed(2)} L ${(-eyeBottomWidth / 2).toFixed(2)} ${(eyeHeight / 2).toFixed(2)} Z`}
        fill="#fff"
      />
    );
  };

  return (
    <span
      {...rest}
      ref={ref}
      title={title}
      className={wrapClass + (className ? ` ${className}` : '')}
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 64 64"
        width="100%"
        height="100%"
        focusable={false}
        aria-hidden={rest['aria-label'] || rest['aria-labelledby'] || title ? undefined : true}
      >
        <g className="blob-shell" style={{animation: bodyAnimation}}>
          <path
            fill="#000"
            d="M32 8C19.5 8 9.5 18 9.5 30.6C9.5 45.3 19.3 56 32 56C44.7 56 54.5 45.3 54.5 30.6C54.5 18 44.5 8 32 8Z"
          />

          <g transform={`translate(${32 + look.x} ${31 + look.y})`}>
            <g>
              {hovered ? (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="-3 0 0;3 0 0;-3 0 0"
                  dur="1500ms"
                  repeatCount="indefinite"
                />
              ) : null}

              <g transform={`translate(${-eyeOffset} 0)`}>
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values={leftEyePulse}
                    keyTimes="0;0.32;0.44;0.56;1"
                    dur="6200ms"
                    begin="-1100ms"
                    repeatCount="indefinite"
                  />
                  <g className="eye-blink" style={{animation: `${blinkAnimation} 4600ms ease-in-out -700ms infinite`}}>
                    {renderEye()}
                  </g>
                </g>
              </g>

              <g transform={`translate(${eyeOffset} 0)`}>
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values={rightEyePulse}
                    keyTimes="0;0.34;0.46;0.58;1"
                    dur="7100ms"
                    begin="-3600ms"
                    repeatCount="indefinite"
                  />
                  <g className="eye-blink" style={{animation: `${blinkAnimation} 5200ms ease-in-out -1800ms infinite`}}>
                    {renderEye()}
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
};

export default BlobFace;