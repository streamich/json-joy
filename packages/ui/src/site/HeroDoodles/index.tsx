import * as React from 'react';
import {rule, keyframes} from 'nano-theme';
import {Doodle} from '../../5-block/Doodle';
import {Floater} from '../../misc/Floater';

const fadeInKf = keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
});

const layerClass = rule({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
  animation: `${fadeInKf} 1.2s ease both`,
  // Decorative only: drop it entirely on small screens.
  '@media only screen and (max-width: 760px)': {display: 'none'},
  '@media (prefers-reduced-motion: reduce)': {animation: 'none'},
});

// Places the cluster; the Floater inside handles all the motion/haze.
const spotClass = rule({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'auto',
});

type Pattern = 'wave' | 'scallop';
type Dir = 'horizontal' | 'vertical' | 'diagonal';

interface Spot {
  x: number;
  y: number;
  rot: number;
  size: number;
  segments: number;
  pattern?: Pattern;
  dir?: Dir;
  opacity: number;
  blur: number;
  tiltX: number;
  tiltY: number;
  tz: number;
  floatDur: number;
  delay: number;
}

const COUNT = 16;
const RX = 47;
const RY = 42;
const SAFE_X = 31;
const SAFE_Y = 27;

const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

const makeSpot = (): Spot => {
  const angle = Math.random() * Math.PI * 2;
  let r = rnd(0.55, 1);
  let x = 50 + Math.cos(angle) * RX * r;
  let y = 50 + Math.sin(angle) * RY * r;
  for (let i = 0; i < 6 && Math.abs(x - 50) < SAFE_X && Math.abs(y - 50) < SAFE_Y; i++) {
    r = Math.min(1.15, r * 1.4);
    x = 50 + Math.cos(angle) * RX * r;
    y = 50 + Math.sin(angle) * RY * r;
  }
  x = Math.max(3, Math.min(97, x));
  y = Math.max(5, Math.min(95, y));

  const depth = Math.random(); // 0 = near, 1 = far
  const pattern: Pattern = Math.random() < 0.3 ? 'scallop' : 'wave';
  const angleDeg = (Math.atan2(y - 50, x - 50) * 180) / Math.PI;

  return {
    x,
    y,
    rot: angleDeg + rnd(-26, 26),
    size: Math.round(150 - depth * 84 + rnd(-8, 16)),
    segments: pick([1, 2, 2, 3]),
    pattern,
    dir: pattern === 'wave' ? pick<Dir>(['horizontal', 'diagonal', 'vertical']) : undefined,
    opacity: +(0.24 - depth * 0.14 + rnd(-0.02, 0.02)).toFixed(3),
    blur: +(0.4 + depth * 2.8).toFixed(2),
    tiltX: +(rnd(-1, 1) * (10 + depth * 16)).toFixed(1),
    tiltY: +(rnd(-1, 1) * (10 + depth * 16)).toFixed(1),
    tz: -Math.round(depth * 120),
    floatDur: +rnd(7, 12).toFixed(1),
    delay: -+rnd(0, 10).toFixed(1),
  };
};

export const HeroDoodles: React.FC = () => {
  // Generated on the client only (new every refresh) to avoid SSR/hydration
  // mismatch from the random layout.
  const [spots, setSpots] = React.useState<Spot[]>([]);
  React.useEffect(() => {
    setSpots(Array.from({length: COUNT}, makeSpot));
  }, []);

  // Periodically light up one random doodle, then let it fade back.
  const [active, setActive] = React.useState(-1);
  React.useEffect(() => {
    if (!spots.length) return;
    let off: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setActive((Math.random() * spots.length) | 0);
      off = setTimeout(() => setActive(-1), 1800);
    }, 4200);
    return () => {
      clearInterval(id);
      clearTimeout(off);
    };
  }, [spots.length]);

  return (
    <div className={layerClass} aria-hidden>
      {spots.map((s, i) => {
        const on = i === active;
        return (
          <span key={i} className={spotClass} style={{left: `${s.x}%`, top: `${s.y}%`}}>
            <Floater
              blur={s.blur}
              opacity={s.opacity}
              rotate={s.rot}
              tiltX={s.tiltX}
              tiltY={s.tiltY}
              tz={s.tz}
              distance={12}
              duration={s.floatDur}
              delay={s.delay}
              sharpenOnHover
              active={on}
            >
              <Doodle
                segments={s.segments}
                size={s.size}
                pattern={s.pattern}
                dir={s.dir}
                dim
                dimOpacity={1}
                brightenOnHover
                bright={on}
              />
            </Floater>
          </span>
        );
      })}
    </div>
  );
};

export default HeroDoodles;
