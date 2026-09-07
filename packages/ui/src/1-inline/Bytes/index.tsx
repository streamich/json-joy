import * as React from 'react';
import {Num} from '../Num';

const SI_UNITS = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
const BIN_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];

const format = (bytes: number, binary: boolean, precision: number): {n: string; unit: string} => {
  if (!Number.isFinite(bytes) || bytes === 0) return {n: '0', unit: 'B'};
  const sign = bytes < 0 ? '-' : '';
  const abs = Math.abs(bytes);
  const base = binary ? 1024 : 1000;
  const units = binary ? BIN_UNITS : SI_UNITS;
  const i = Math.min(units.length - 1, Math.floor(Math.log(abs) / Math.log(base)));
  const value = abs / base ** i;
  const fixed = i === 0 ? value.toFixed(0) : value.toFixed(precision);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return {n: sign + trimmed, unit: units[i]};
};

export interface BytesProps {
  /** Size in bytes. */
  value: number;
  /** Use binary (1024) units instead of decimal (1000). Default: false. */
  binary?: boolean;
  /** Decimal precision (digits after the dot). Default: 1. */
  precision?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Human-scaled byte size: unit scaling and zero-trimming here, {@link Num} renders. */
export const Bytes: React.FC<BytesProps> = ({value, binary = false, precision = 1, className, style}) => {
  const {n, unit} = React.useMemo(() => format(value, binary, precision), [value, binary, precision]);
  return (
    <Num value={Number(n)} unit={unit} title={`${value.toLocaleString()} bytes`} className={className} style={style} />
  );
};
