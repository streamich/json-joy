import * as React from 'react';
import {keyframes, rule} from 'nano-theme';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

const randomSigned = (min: number, max: number): number => {
  const amount = randomBetween(min, max);
  return (Math.random() < 0.5 ? -1 : 1) * amount;
};

const lookMaxDistance = 600;
const lookMaxTravelX = 12.8;
const lookMaxTravelY = 9.4;
const lookMaxOvershootX = 13.15;
const lookMaxOvershootY = 9.85;

interface BlobFaceGesturePose {
  headX: number;
  headY: number;
  headRotate: number;
  eyeX: number;
  eyeY: number;
  eyeSpread: number;
  eyeScale: number;
  leftEyeTilt: number;
  rightEyeTilt: number;
  squintScale: number;
}

interface BlobFaceGestureKeyframe {
  at: number;
  pose: BlobFaceGesturePose;
}

interface BlobFaceGestureScript {
  duration: number;
  keyframes: BlobFaceGestureKeyframe[];
}

const createGesturePose = (overrides: Partial<BlobFaceGesturePose> = {}): BlobFaceGesturePose => ({
  headX: 0,
  headY: 0,
  headRotate: 0,
  eyeX: 0,
  eyeY: 0,
  eyeSpread: 0,
  eyeScale: 1,
  leftEyeTilt: 0,
  rightEyeTilt: 0,
  squintScale: 1,
  ...overrides,
});

const interpolateNumber = (from: number, to: number, progress: number): number => from + (to - from) * progress;

const interpolatePose = (from: BlobFaceGesturePose, to: BlobFaceGesturePose, progress: number): BlobFaceGesturePose => {
  const eyeScaleProgress = clamp(progress * 4, 0, 1);

  return {
    headX: interpolateNumber(from.headX, to.headX, progress),
    headY: interpolateNumber(from.headY, to.headY, progress),
    headRotate: interpolateNumber(from.headRotate, to.headRotate, progress),
    eyeX: interpolateNumber(from.eyeX, to.eyeX, progress),
    eyeY: interpolateNumber(from.eyeY, to.eyeY, progress),
    eyeSpread: interpolateNumber(from.eyeSpread, to.eyeSpread, progress),
    eyeScale: interpolateNumber(from.eyeScale, to.eyeScale, eyeScaleProgress),
    leftEyeTilt: interpolateNumber(from.leftEyeTilt, to.leftEyeTilt, progress),
    rightEyeTilt: interpolateNumber(from.rightEyeTilt, to.rightEyeTilt, progress),
    squintScale: interpolateNumber(from.squintScale, to.squintScale, progress),
  };
};

const sameGesturePose = (a: BlobFaceGesturePose, b: BlobFaceGesturePose): boolean =>
  a.headX === b.headX &&
  a.headY === b.headY &&
  a.headRotate === b.headRotate &&
  a.eyeX === b.eyeX &&
  a.eyeY === b.eyeY &&
  a.eyeSpread === b.eyeSpread &&
  a.eyeScale === b.eyeScale &&
  a.leftEyeTilt === b.leftEyeTilt &&
  a.rightEyeTilt === b.rightEyeTilt &&
  a.squintScale === b.squintScale;

const sampleGesturePose = (script: BlobFaceGestureScript, progress: number): BlobFaceGesturePose => {
  const clampedProgress = clamp(progress, 0, 1);
  const frames = script.keyframes;

  if (clampedProgress <= frames[0].at) return frames[0].pose;

  for (let index = 1; index < frames.length; index++) {
    const previous = frames[index - 1];
    const current = frames[index];
    if (clampedProgress <= current.at) {
      const span = current.at - previous.at || 1;
      const localProgress = clamp((clampedProgress - previous.at) / span, 0, 1);
      return interpolatePose(previous.pose, current.pose, localProgress);
    }
  }

  return frames[frames.length - 1].pose;
};

const yesGestureScript: BlobFaceGestureScript = {
  duration: 1100,
  keyframes: [
    {at: 0, pose: createGesturePose()},
    {at: 0.12, pose: createGesturePose({headY: -0.8, eyeY: 3.9, eyeScale: 0.84})},
    {at: 0.3, pose: createGesturePose({headY: 2.8, headRotate: 2.6, eyeY: -7.95, eyeScale: 0.75, squintScale: 0.9})},
    {at: 0.48, pose: createGesturePose({headY: -0.35, headRotate: -0.35, eyeY: 5.25, eyeScale: 0.8})},
    {at: 0.68, pose: createGesturePose({headY: 2.1, headRotate: 2.15, eyeY: -6.45, eyeScale: 0.75, squintScale: 0.93})},
    {at: 0.86, pose: createGesturePose({headY: 0.25, headRotate: 0.35, eyeY: 2.85, eyeScale: 0.88})},
    {at: 1, pose: createGesturePose()},
  ],
};

const noGestureScript: BlobFaceGestureScript = {
  duration: 960,
  keyframes: [
    {at: 0, pose: createGesturePose()},
    {at: 0.16, pose: createGesturePose({headX: -2.2, headRotate: -9, eyeX: 9.45, eyeY: -0.7, eyeScale: 1.18, leftEyeTilt: -4.8, rightEyeTilt: -4.8})},
    {at: 0.34, pose: createGesturePose({headX: 2.35, headRotate: 9.5, eyeX: -10.05, eyeY: 0.9, eyeScale: 1.25, leftEyeTilt: 5.2, rightEyeTilt: 5.2})},
    {at: 0.52, pose: createGesturePose({headX: -1.85, headRotate: -6.5, eyeX: 7.35, eyeY: -0.55, eyeScale: 1.21, leftEyeTilt: -3.6, rightEyeTilt: -3.6})},
    {at: 0.72, pose: createGesturePose({headX: 1.35, headRotate: 4.6, eyeX: -5.7, eyeY: 0.62, eyeScale: 1.15, leftEyeTilt: 2.8, rightEyeTilt: 2.8})},
    {at: 0.88, pose: createGesturePose({headX: -0.45, headRotate: -1.5, eyeX: 2.1, eyeY: -0.18, eyeScale: 1.08, leftEyeTilt: -0.8, rightEyeTilt: -0.8})},
    {at: 1, pose: createGesturePose()},
  ],
};

const idkGestureScript: BlobFaceGestureScript = {
  duration: 1380,
  keyframes: [
    {at: 0, pose: createGesturePose()},
    {at: 0.16, pose: createGesturePose({headX: -1.1, headY: 0.2, headRotate: -10.5, eyeX: 0.85, eyeY: -0.55, eyeSpread: 2.3, leftEyeTilt: -5.5, rightEyeTilt: -2.5, squintScale: 0.96})},
    {at: 0.4, pose: createGesturePose({headX: 1.3, headY: -0.15, headRotate: 9.2, eyeX: -0.45, eyeY: -2.7, eyeSpread: 1.1, leftEyeTilt: 2.4, rightEyeTilt: 5.8, squintScale: 0.94})},
    {at: 0.68, pose: createGesturePose({headX: -0.8, headY: 0.3, headRotate: -5.8, eyeX: 0.3, eyeY: -3.6, eyeSpread: 0.45, leftEyeTilt: -2.2, rightEyeTilt: 2.8, squintScale: 0.98})},
    {at: 0.86, pose: createGesturePose({headX: 0.45, headRotate: 3.9, eyeX: -0.15, eyeY: -1.9, eyeSpread: 0.12, leftEyeTilt: 1.1, rightEyeTilt: 2.2})},
    {at: 1, pose: createGesturePose()},
  ],
};

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

export interface BlobFaceHandle {
  yes(): void;
  no(): void;
  idk(): void;
}

export interface BlobFaceProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  onHandle?: (handle: BlobFaceHandle | null) => void;
}

interface EyeMotionEvent {
  key: number;
  value: number;
}

export const BlobFace: React.FC<BlobFaceProps> = ({
  size = 28,
  className,
  style,
  onHandle,
  onMouseEnter,
  onMouseLeave,
  onClick,
  title,
  ...rest
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const gestureAnimationRef = React.useRef({rafId: 0, token: 0});
  const gestureRunnerRef = React.useRef<(script: BlobFaceGestureScript) => void>(() => undefined);
  const handleRef = React.useRef<BlobFaceHandle | null>(null);
  const lookStateRef = React.useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tx: 0,
    ty: 0,
    renderedX: 0,
    renderedY: 0,
    rafId: 0,
  });
  const [hovered, setHovered] = React.useState(false);
  const [look, setLook] = React.useState({x: 0, y: 0});
  const [leftEyeShift, setLeftEyeShift] = React.useState<EyeMotionEvent>({key: 0, value: 0});
  const [rightEyeShift, setRightEyeShift] = React.useState<EyeMotionEvent>({key: 0, value: 0});
  const [leftEyeTilt, setLeftEyeTilt] = React.useState(0);
  const [rightEyeTilt, setRightEyeTilt] = React.useState(0);
  const [idleSquint, setIdleSquint] = React.useState(false);
  const [gestureActive, setGestureActive] = React.useState(false);
  const [gesturePose, setGesturePose] = React.useState<BlobFaceGesturePose>(() => createGesturePose());

  if (!handleRef.current) {
    handleRef.current = {
      yes: () => gestureRunnerRef.current(yesGestureScript),
      no: () => gestureRunnerRef.current(noGestureScript),
      idk: () => gestureRunnerRef.current(idkGestureScript),
    };
  }

  gestureRunnerRef.current = (script: BlobFaceGestureScript) => {
    const animation = gestureAnimationRef.current;
    animation.token += 1;
    const token = animation.token;

    if (animation.rafId) cancelAnimationFrame(animation.rafId);

    setGestureActive(true);
    setGesturePose(script.keyframes[0].pose);

    const startedAt = performance.now();
    const tick = (now: number) => {
      if (gestureAnimationRef.current.token !== token) return;

      const progress = clamp((now - startedAt) / script.duration, 0, 1);
      const nextPose = sampleGesturePose(script, progress);
      setGesturePose((prev) => (sameGesturePose(prev, nextPose) ? prev : nextPose));

      if (progress < 1) {
        animation.rafId = requestAnimationFrame(tick);
        return;
      }

      animation.rafId = 0;
      setGesturePose(createGesturePose());
      setGestureActive(false);
    };

    animation.rafId = requestAnimationFrame(tick);
  };

  React.useEffect(() => {
    return () => {
      const animation = gestureAnimationRef.current;
      animation.token += 1;
      if (animation.rafId) cancelAnimationFrame(animation.rafId);
    };
  }, []);

  React.useEffect(() => {
    onHandle?.(handleRef.current);

    return () => {
      onHandle?.(null);
    };
  }, [onHandle]);

  React.useEffect(() => {
    const state = lookStateRef.current;

    const tick = () => {
      const s = lookStateRef.current;
      const dx = s.tx - s.x;
      const dy = s.ty - s.y;

      s.vx = (s.vx + dx * 0.22) * 0.64;
      s.vy = (s.vy + dy * 0.22) * 0.64;
      s.x = clamp(s.x + s.vx, -lookMaxOvershootX, lookMaxOvershootX);
      s.y = clamp(s.y + s.vy, -lookMaxOvershootY, lookMaxOvershootY);

      const settled = Math.abs(dx) < 0.03 && Math.abs(dy) < 0.03 && Math.abs(s.vx) < 0.03 && Math.abs(s.vy) < 0.03;
      if (settled) {
        s.x = s.tx;
        s.y = s.ty;
        s.vx = 0;
        s.vy = 0;
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
      const reach = clamp(distance / lookMaxDistance, 0, 1);
      const easedReach = 1 - Math.pow(1 - reach, 3);
      const directionX = distance > 0.001 ? dx / distance : 0;
      const directionY = distance > 0.001 ? dy / distance : 0;

      const nextTx = Number(clamp(directionX * lookMaxTravelX * easedReach, -lookMaxTravelX, lookMaxTravelX).toFixed(2));
      const nextTy = Number(clamp(directionY * lookMaxTravelY * easedReach, -lookMaxTravelY, lookMaxTravelY).toFixed(2));
      const impulseX = clamp((nextTx - state.tx) * 0.16, -0.95, 0.95);
      const impulseY = clamp((nextTy - state.ty) * 0.15, -0.8, 0.8);

      state.tx = nextTx;
      state.ty = nextTy;
      state.vx = clamp(state.vx + impulseX, -2.2, 2.2);
      state.vy = clamp(state.vy + impulseY, -1.9, 1.9);
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

  React.useEffect(() => {
    if (gestureActive) {
      setLeftEyeShift((prev) => (prev.key === 0 && prev.value === 0 ? prev : {key: 0, value: 0}));
      setRightEyeShift((prev) => (prev.key === 0 && prev.value === 0 ? prev : {key: 0, value: 0}));
      return;
    }

    const timers = new Set<number>();

    const schedule = (setEvent: React.Dispatch<React.SetStateAction<EyeMotionEvent>>, delay: number) => {
      const loop = (nextDelay: number) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          const nextValue = Number(randomSigned(0.7, 1.8).toFixed(2));
          setEvent((prev) => ({key: prev.key + 1, value: nextValue}));
          loop(1200 + Math.random() * 2600);
        }, nextDelay);

        timers.add(timer);
      };

      loop(delay);
    };

    schedule(setLeftEyeShift, 900 + Math.random() * 1000);
    schedule(setRightEyeShift, 1400 + Math.random() * 1100);

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [gestureActive]);

  React.useEffect(() => {
    if (!hovered || gestureActive) {
      setLeftEyeTilt(0);
      setRightEyeTilt(0);
      return;
    }

    const timers = new Set<number>();
    const rafIds = new Set<number>();
    let cancelled = false;

    const animateTilt = (setTilt: React.Dispatch<React.SetStateAction<number>>, target: number, duration: number, onDone: () => void) => {
      const startedAt = performance.now();
      let rafId = 0;

      const tick = (now: number) => {
        if (rafId) rafIds.delete(rafId);
        if (cancelled) return;

        const progress = clamp((now - startedAt) / duration, 0, 1);
        const rawValue = (() => {
          if (progress < 0.18) return target * (progress / 0.18);
          if (progress < 0.82) return target;
          return target * (1 - (progress - 0.82) / 0.18);
        })();
        const nextValue = Number(rawValue.toFixed(2));
        setTilt((prev) => (prev === nextValue ? prev : nextValue));

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
          rafIds.add(rafId);
          return;
        }

        setTilt((prev) => (prev === 0 ? prev : 0));
        onDone();
      };

      rafId = requestAnimationFrame(tick);
      rafIds.add(rafId);
    };

    const schedule = (setTilt: React.Dispatch<React.SetStateAction<number>>, delay: number) => {
      const loop = (nextDelay: number) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          if (cancelled) return;

          const nextValue = Number(randomBetween(-20, 20).toFixed(2));
          const duration = 1500 + Math.random() * 500;
          animateTilt(setTilt, nextValue, duration, () => {
            if (!cancelled) loop(420 + Math.random() * 1100);
          });
        }, nextDelay);

        timers.add(timer);
      };

      loop(delay);
    };

    schedule(setLeftEyeTilt, 160 + Math.random() * 700);
    schedule(setRightEyeTilt, 320 + Math.random() * 900);

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
      for (const rafId of rafIds) cancelAnimationFrame(rafId);
    };
  }, [hovered, gestureActive]);

  React.useEffect(() => {
    if (hovered || gestureActive) {
      setIdleSquint(false);
      return;
    }

    let timer = 0;

    const queueSquint = () => {
      if (timer) window.clearTimeout(timer);

      timer = window.setTimeout(() => {
        timer = 0;
        setIdleSquint(true);
      }, 1400);
    };

    const onMove = () => {
      setIdleSquint(false);
      queueSquint();
    };

    queueSquint();
    window.addEventListener('mousemove', onMove);

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('mousemove', onMove);
    };
  }, [hovered, gestureActive]);

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
  const lookReach = clamp(Math.hypot(look.x / lookMaxTravelX, look.y / lookMaxTravelY), 0, 1);
  const eyeOffsetBase = hovered ? 5.4 : 4.5;
  const eyeOffset = Number(clamp(eyeOffsetBase - lookReach * (hovered ? 1.45 : 1.05), 3.35, eyeOffsetBase).toFixed(2));
  const eyeTopWidth = eyeWidth + 0.9;
  const eyeBottomWidth = eyeWidth - 0.6;
  const eyeLookX = Number((look.x + gesturePose.eyeX).toFixed(2));
  const eyeLookY = Number((look.y + gesturePose.eyeY).toFixed(2));
  const eyeGestureSpread = Number(gesturePose.eyeSpread.toFixed(2));
  const eyeGestureScale = Number(clamp(gesturePose.eyeScale, 0.75, 1.25).toFixed(2));
  const combinedLeftEyeTilt = Number((leftEyeTilt + gesturePose.leftEyeTilt).toFixed(2));
  const combinedRightEyeTilt = Number((rightEyeTilt + gesturePose.rightEyeTilt).toFixed(2));
  const eyeSquintScale = Number(clamp((hovered ? 1 : idleSquint ? 0.28 : 1) * gesturePose.squintScale, 0.2, 1).toFixed(2));
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
        <g transform={`translate(${gesturePose.headX.toFixed(2)} ${gesturePose.headY.toFixed(2)})`}>
          <g transform={`rotate(${gesturePose.headRotate.toFixed(2)} 32 32)`}>
            <g className="blob-shell" style={{animation: bodyAnimation}}>
              <path
                fill="#000"
                d="M32 8C19.5 8 9.5 18 9.5 30.6C9.5 45.3 19.3 56 32 56C44.7 56 54.5 45.3 54.5 30.6C54.5 18 44.5 8 32 8Z"
              />

              <g transform={`translate(${32 + eyeLookX} ${31 + eyeLookY})`}>
                <g>
                  <g>
                    <g transform={`rotate(${combinedLeftEyeTilt})`}>
                      <g transform={`translate(${(-eyeOffset - eyeGestureSpread).toFixed(2)} 0)`}>
                        <g>
                          {leftEyeShift.key ? (
                            <animateTransform
                              key={`left-eye-shift-${leftEyeShift.key}`}
                              attributeName="transform"
                              type="translate"
                              values={`0 0;0 ${leftEyeShift.value};0 0`}
                              dur="520ms"
                              begin="0s"
                              repeatCount="1"
                            />
                          ) : null}
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
                            <g transform={`scale(${eyeGestureScale} ${(eyeGestureScale * eyeSquintScale).toFixed(2)})`}>
                              <g className="eye-blink" style={{animation: `${blinkAnimation} 4600ms ease-in-out -700ms infinite`}}>
                                {renderEye()}
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>

                  <g>
                    <g transform={`rotate(${combinedRightEyeTilt})`}>
                      <g transform={`translate(${(eyeOffset + eyeGestureSpread).toFixed(2)} 0)`}>
                        <g>
                          {rightEyeShift.key ? (
                            <animateTransform
                              key={`right-eye-shift-${rightEyeShift.key}`}
                              attributeName="transform"
                              type="translate"
                              values={`0 0;0 ${rightEyeShift.value};0 0`}
                              dur="560ms"
                              begin="0s"
                              repeatCount="1"
                            />
                          ) : null}
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
                            <g transform={`scale(${eyeGestureScale} ${(eyeGestureScale * eyeSquintScale).toFixed(2)})`}>
                              <g className="eye-blink" style={{animation: `${blinkAnimation} 5200ms ease-in-out -1800ms infinite`}}>
                                {renderEye()}
                              </g>
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
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