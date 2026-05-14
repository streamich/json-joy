import * as React from 'react';
import {rule} from 'nano-theme';
import {HrLine} from '../../components/blocks/hr/HrLine';
import {ITEM_GAP} from './settings';
import type {LineStyle} from './types';

const connectorClass = rule({
  pos: 'absolute',
  l: '50%',
  transform: 'translateX(-50%)',
  bottom: `-${ITEM_GAP - 4}px`,
  d: 'flex',
  fld: 'column',
  ai: 'center',
  trs: 'color .12s ease',
});

export interface ConnectorProps {
  style: LineStyle;
  color: string;
  width: number;
  /** Distance in px from the top of the indicator column to the connector start. */
  top: number;
}

/** Vertical line connecting one step's bullet to the next step's bullet. */
export const Connector: React.FC<ConnectorProps> = ({style, color, width, top}) => {
  if (style === 'none' || width <= 0) return null;

  return (
    <span className={connectorClass} style={{top: `${top}px`, color}}>
      <HrLine orientation="vertical" strokeWidth={width} style={style} />
    </span>
  );
};
