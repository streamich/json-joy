import * as React from 'react';
import ExclamationTriangleIcon__svg from 'iconista/lib/react/bootstrap/exclamation-triangle';
import {Hint} from '../../../1-inline/Hint';
import {useStyles} from '../../../styles/context';
import {BasicTooltip} from '../../BasicTooltip';

export interface FieldHintProps {
  /** Full restrictions note, shown in the tooltip. */
  note: string;
  /** Compact text inside the pill (e.g. 'URL', '4-80'). */
  label?: string;
  /** Show the warning triangle inside the pill. */
  warn?: boolean;
  style?: React.CSSProperties;
}

/** Constraint pill: warning triangle and/or compact label, full note in a tooltip. */
export const FieldHint: React.FC<FieldHintProps> = ({note, label, warn, style}) => {
  const styles = useStyles();
  return (
    <BasicTooltip renderTooltip={() => note}>
      <Hint aria-label={note} style={{verticalAlign: 'middle', flexShrink: 0, ...style}}>
        {warn && (
          <span style={{display: 'inline-flex', color: styles.warning.fg.toString()}}>
            <ExclamationTriangleIcon__svg width={11} height={11} />
          </span>
        )}
        {label}
      </Hint>
    </BasicTooltip>
  );
};
