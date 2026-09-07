import * as React from 'react';
import {useT} from 'use-t';
import {Meta} from '../../../1-inline/Meta';
import {EmptyValue} from '../EmptyValue';
import {ValueCellSurface} from '../ValueCellSurface';
import {ArgBool, type ArgBoolProps, boolArg} from './ArgBool';

export interface ArgBoolRevealProps extends ArgBoolProps {
  /**
   * Whether the cell fills the row width (card/block) or hugs its content.
   * @default true
   */
  stretch?: boolean;
}

/**
 * The `reveal` edit-mode presentation of a bool field. At rest shows only a
 * short state text — `param.label(state)`, or "Yes" / "No" (an "Empty"
 * placeholder for the unset `null` state). Hovering highlights the whole
 * value cell (same `ValueCellSurface` ghost surface as `ValueCell`) and
 * inlines the live {@link ArgBool} control in place of the text — no popup.
 * Clicking anywhere in the cell toggles the value; clicks landing on the
 * inlined control are handled (and consumed) by the control itself.
 */
export const ArgBoolReveal: React.FC<ArgBoolRevealProps> = (props) => {
  const {param, value, onChange, align = 'left', stretch = true} = props;
  const [t] = useT();
  const [hover, setHover] = React.useState(false);

  const {def, state, toggleValue, enterCustom} = boolArg(param, value, onChange);

  const resting = param.label ? (
    param.label(state)
  ) : state === null ? (
    <EmptyValue />
  ) : (
    <Meta caps>{t(state ? 'Yes' : 'No')}</Meta>
  );
  const toggle = def ? enterCustom : toggleValue;

  return (
    <ValueCellSurface
      align={align}
      stretch={stretch}
      muted={def}
      role="checkbox"
      aria-checked={state === null ? 'mixed' : state}
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {hover ? (
        <ArgBool param={param} value={value} onChange={onChange} align={align} />
      ) : (
        <span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{resting}</span>
      )}
    </ValueCellSurface>
  );
};
