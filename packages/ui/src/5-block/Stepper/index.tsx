import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {useStyles} from '../../styles/context';
import {Line, type HrLineStyle} from '../../3-list-item/Line';
import {NumberBadge} from '../../2-inline-block/NumberBadge';

export interface StepperStep {
  /** Content of the badge. Falls back to the 1-based step number. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Mark the step as optional: rendered de-emphasized with an "Optional" tag. */
  optional?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /** 0-based index of the current step. Steps up to and including it render emphasized. */
  active?: number;
  /** Connector line style. Defaults to a thin solid line. */
  lineStyle?: HrLineStyle;
  /** Connector line thickness in px. */
  lineWidth?: number;
  /** Smaller badges and tighter spacing between steps. */
  compact?: boolean;
  className?: string;
}

const BADGE = 40;
const BADGE_SM = 34;
const BADGE_COMPACT = 28;
const GAP = 32;
const GAP_COMPACT = 18;
const LINE_GAP = 8;
const LINE_GAP_COMPACT = 4;
const sm = '@media only screen and (max-width: 600px)';

const listClass = rule({
  d: 'flex',
  flexDirection: 'column',
  listStyle: 'none',
  mar: 0,
  pad: 0,
});

const stepClass = rule({
  d: 'flex',
  ai: 'stretch',
  gap: '16px',
  [sm]: {gap: '14px'},
});

const railClass = rule({
  d: 'flex',
  flexDirection: 'column',
  ai: 'center',
  flex: '0 0 auto',
});

const connectorClass = rule({
  d: 'flex',
  flexDirection: 'column',
  ai: 'center',
  flex: '1 1 auto',
  minHeight: '16px',
  pad: LINE_GAP + 'px 0',
});

const contentClass = rule({
  flex: '1 1 auto',
  minW: 0,
});

const titleRowClass = rule({
  d: 'flex',
  ai: 'center',
  minHeight: BADGE + 'px',
  [sm]: {minHeight: BADGE_SM + 'px'},
});

const titleClass = rule({
  ...theme.font.display.bold,
  fz: '18px',
  lh: '1.3em',
  mar: 0,
  pad: 0,
});

const bodyClass = rule({
  ...theme.font.display.lite,
  fz: '15.5px',
  lh: '1.6em',
  maxW: '52ch',
  mar: '2px 0 0',
  pad: 0,
});

const optionalClass = rule({
  ...theme.font.display.bold,
  d: 'inline-block',
  flex: '0 0 auto',
  fz: '10px',
  lh: 1,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  mar: '0 0 0 10px',
  pad: '4px 7px',
  bdrad: '5px',
});

/**
 * Vertical stepper: numbered (or icon) badges down a rail joined by a
 * connector, with a title and body beside each. Pass `active` to show progress.
 */
export const Stepper: React.FC<StepperProps> = ({
  steps,
  active,
  lineStyle = 'solid',
  lineWidth = 1,
  compact,
  className,
}) => {
  const styles = useStyles();
  const sg = (l: number, a?: number) => '' + (a === undefined ? styles.g(l) : styles.g(l, a));
  const last = steps.length - 1;
  const act = active ?? last;
  const badgeSize = compact ? BADGE_COMPACT : BADGE;
  const gap = compact ? GAP_COMPACT : GAP;
  const badgeStyle: React.CSSProperties | undefined = compact
    ? {width: BADGE_COMPACT, height: BADGE_COMPACT, borderRadius: 8, fontSize: '13px'}
    : undefined;

  const onBadge: React.CSSProperties = {
    borderColor: sg(0.85),
    color: sg(0.25),
    // background: sg(1),
    boxShadow: `0 1px 2px ${sg(0, 0.06)}, 0 -3px 0 ${sg(0, 0.02)} inset, 0 -1px 0 ${sg(0, 0.03)} inset`,
  };
  const offBadge: React.CSSProperties = {
    borderColor: sg(0.9),
    color: sg(0.66),
    background: sg(0.99),
    boxShadow: 'none',
  };
  const onLine = sg(0.8);
  const offLine = sg(0.9);

  return (
    <ol className={listClass + (className ? ' ' + className : '')}>
      {steps.map((step, i) => {
        const isLast = i === last;
        const on = i <= act;
        const badgeOn = on && !step.optional;
        const lineOn = i < act;
        const nextOptional = !!steps[i + 1]?.optional;
        const topStyle: HrLineStyle = step.optional ? 'dashed' : lineStyle;
        const botStyle: HrLineStyle = nextOptional ? 'dashed' : lineStyle;
        const split = !!step.optional || nextOptional;
        const isMasked = (s: HrLineStyle) => s === 'dotted' || s === 'squiggly';
        const lineColor = lineOn ? onLine : offLine;
        const connectorStyle: React.CSSProperties = {};
        if (!isMasked(topStyle) && !isMasked(botStyle)) connectorStyle.width = lineWidth;
        if (compact) connectorStyle.padding = `${LINE_GAP_COMPACT}px 0`;
        return (
          <li key={i} className={stepClass}>
            <div className={railClass}>
              <NumberBadge
                style={{
                  ...(badgeOn ? onBadge : offBadge),
                  ...(step.optional ? {borderStyle: 'dashed'} : null),
                  ...badgeStyle,
                }}
              >
                {step.icon ?? i + 1}
              </NumberBadge>
              {!isLast && (
                <span className={connectorClass} style={connectorStyle}>
                  {split ? (
                    <>
                      <Line orientation="vertical" strokeWidth={lineWidth} style={topStyle} color={lineColor} />
                      <Line orientation="vertical" strokeWidth={lineWidth} style={botStyle} color={lineColor} />
                    </>
                  ) : (
                    <Line orientation="vertical" strokeWidth={lineWidth} style={lineStyle} color={lineColor} />
                  )}
                </span>
              )}
            </div>
            <div className={contentClass} style={{paddingBottom: isLast ? 0 : gap}}>
              <div className={titleRowClass} style={compact ? {minHeight: badgeSize} : undefined}>
                <h3 className={titleClass} style={{color: sg(on ? 0.1 : 0.55)}}>
                  {step.title}
                </h3>
                {step.optional && (
                  <span className={optionalClass} style={{color: sg(0.5), background: sg(0.93)}}>
                    Optional
                  </span>
                )}
              </div>
              {!!step.body && (
                <p className={bodyClass} style={{color: sg(on ? 0.4 : 0.62)}}>
                  {step.body}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
