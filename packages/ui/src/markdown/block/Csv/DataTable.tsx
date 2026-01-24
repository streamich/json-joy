import * as React from 'react';
import {rule} from 'nano-theme';
import {Markdown} from '../../Markdown';
import {MyTable} from './MyTable';
import {Paper} from '../../../4-card/Paper';

const {createElement: h} = React;

const tableClass = rule({
  '& td,& th': {
    minW: '50px',
  },
  '& td:first-child,& th:first-child': {
    minW: '100px',
  },
});

export interface DataTableProps {
  data: Array<Array<string>>;
  // align?: Array<'left' | 'right' | 'center' | null | undefined>;
}

const DataTable: React.FC<DataTableProps> = ({data}) => {
  const [head, ...body] = data;

  return (
    <Paper style={{overflowX: 'scroll'}}>
      <MyTable className={tableClass}>
        <th>
          {h(
            'tr',
            {},
            ...head.map((cell, i) => (
              <td key={i}>
                <Markdown inline src={cell} />
              </td>
            )),
          )}
        </th>
        {h(
          'tbody',
          {},
          ...body.map((row) =>
            h(
              'tr',
              {},
              ...row.map((cell, i) => (
                <td key={i}>
                  <Markdown inline src={cell} />
                </td>
              )),
            ),
          ),
        )}
      </MyTable>
    </Paper>
  );
};

export default DataTable;
