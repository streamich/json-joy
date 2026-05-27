import * as React from 'react';
import {rule, theme} from 'nano-theme';

const bp = '@media only screen and (max-width: 800px)';

const cardCls = rule({
  d: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  bxz: 'border-box',
  pad: '40px 32px',
  bdrad: '20px',
});

const valueRowCls = rule({
  d: 'flex',
  alignItems: 'baseline',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px',
});

const valueCls = rule({
  ...theme.font.display.black,
  fz: '64px',
  lh: '1em',
  [bp]: {fz: '48px'},
});

const unitCls = rule({
  ...theme.font.display.bold,
  fz: '26px',
  lh: '1em',
  [bp]: {fz: '20px'},
});

const labelCls = rule({
  ...theme.font.ui2.lite,
  fz: '16px',
  lh: '1.5em',
  mar: '12px 0 0',
  maxW: '300px',
});

const gradientText: React.CSSProperties = {
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
};

export interface StatProps {
  /** The headline metric, e.g. "3.8%" or "100x". */
  value: React.ReactNode;
  /** Small qualifier shown next to the value, e.g. "faster". */
  unit?: React.ReactNode;
  /** Supporting text shown under the metric. */
  label?: React.ReactNode;
  /** CSS gradient painted onto the metric text. Falls back to `color` when omitted. */
  gradient?: string;
  /** Solid metric color, used when `gradient` is not set. */
  color?: React.CSSProperties['color'];
  /** Color of the unit qualifier. Defaults to the surrounding text color. */
  unitColor?: React.CSSProperties['color'];
  /** Color of the supporting text. */
  labelColor?: React.CSSProperties['color'];
  /** Card background. Omit for no card chrome. */
  background?: React.CSSProperties['background'];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A headline statistic: a large metric over a line of supporting text. The
 * metric is painted with `gradient` when given, otherwise the solid `color`. An
 * optional `unit` qualifier (e.g. "faster") sits beside the value at a smaller
 * size for typographic contrast.
 */
export const Stat: React.FC<StatProps> = ({
  value,
  unit,
  label,
  gradient,
  color,
  unitColor,
  labelColor,
  background,
  className,
  style,
}) => {
  const valueStyle: React.CSSProperties = gradient ? {backgroundImage: gradient, ...gradientText} : {color};
  return (
    <div className={cardCls + (className ? ' ' + className : '')} style={{background, ...style}}>
      <div className={valueRowCls}>
        <span className={valueCls} style={valueStyle}>
          {value}
        </span>
        {!!unit && (
          <span className={unitCls} style={{color: unitColor}}>
            {unit}
          </span>
        )}
      </div>
      {!!label && (
        <div className={labelCls} style={{color: labelColor}}>
          {label}
        </div>
      )}
    </div>
  );
};

export default Stat;
