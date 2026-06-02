import * as React from 'react';
import {rule, theme} from 'nano-theme';
import {MiniTitle} from '../../3-list-item/MiniTitle';
import {Line} from '../../3-list-item/Line';

const colPad = 'clamp(16px, 2.6vw, 44px)';

const tableClass = rule({
  ...theme.font.display.mid,
  w: '100%',
  borderCollapse: 'collapse',
  fz: '14px',
  lh: '1.7em',
  '& th, & td': {ta: 'left', verticalAlign: 'top', pad: `18px ${colPad}`},
  '& thead th': {
    verticalAlign: 'bottom',
    pad: `16px ${colPad}`,
    // bdt: `2px solid ${theme.g(0.33)}`,
    bdb: `1px solid ${theme.g(0.66)}`,
  },
  '& tbody th, & tbody td': {bdb: `1px solid ${theme.g(0.92)}`},
  '& tbody tr:last-child th, & tbody tr:last-child td': {
    // bdb: `1px solid ${theme.g(0.66)}`
    // bdb: `2px solid ${theme.g(0.33)}`,
  },
  '& tr > :first-child': {paddingLeft: 0},
  '& tr > :last-child': {paddingRight: 0},
});

const featTdClass = rule({
  ...theme.font.display.bold,
  // ...theme.font.display.mid,
  col: theme.g(0.15),
});

const primaryTdClass = rule({
  ...theme.font.display.mid,
  col: theme.g(0.15),
});

const tdClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.4),
});

const noteClass = rule({
  ...theme.font.display.lite,
  col: theme.g(0.55),
  fz: '12px',
  lh: '1.6em',
  mar: '20px 0 0',
  pad: 0,
});

export interface ComparisonRow {
  feature: React.ReactNode;
  /** One cell per column, in column order. */
  cells: React.ReactNode[];
}

export interface ComparisonTableProps {
  /** Column headers, in order. The first data column is emphasized. */
  columns: React.ReactNode[];
  rows: ComparisonRow[];
  /** Small note under the table. */
  note?: React.ReactNode;
}

/**
 * Reusable comparison table: a heading and a feature-by-column table. The
 * first data column is emphasized.
 */
export const ComparisonTable: React.FC<ComparisonTableProps> = ({columns, rows, note}) => {
  return (
    <section>
      <div>
        <Line strokeWidth={2} color={theme.g(0.1)} style="squiggly" />
        <table className={tableClass}>
          <thead>
            <tr>
              <th scope="col" className={featTdClass}>
                {/* <MiniTitle>Feature</MiniTitle> */}
                {/* Feature */}
              </th>
              {columns.map((col, i) => (
                <th key={i} scope="col" className={featTdClass}>
                  <MiniTitle contrast>{col}</MiniTitle>
                  {/* {col} */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <th className={featTdClass} scope="row">
                  {row.feature}
                </th>
                {row.cells.map((cell, j) => (
                  <td key={j} className={j === 0 ? primaryTdClass : tdClass}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* <Line strokeWidth={2} color={theme.g(0.1)} style='squiggly' /> */}
      </div>
      {!!note && <p className={noteClass}>{note}</p>}
    </section>
  );
};

export default ComparisonTable;
