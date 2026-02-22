import * as React from 'react';
import {rule} from 'nano-theme';
import MarkdownBlock from '../../util/MarkdownBlock';
import isFirstLevelBlockElement from '../../util/isFirstLevelBlockElement';
import MarkdownFullWidthBlock from '../../util/MarkdownFullWidthBlock';
import DataTable, {type DataTableProps} from './DataTable';
import {context} from '../../context';

const {useContext} = React;

const tableCompactClass = rule({
  '& td,& th': {
    padl: '12px',
    padr: '12px',
  },
  '& td:first-child,& th:first-child': {
    padl: '16px',
  },
  '& td:last-child,& th:last-child': {
    padr: '16px',
  },
});

const tableExtraCompactClass = rule({
  '& td,& th': {
    padl: '4px',
    padr: '4px',
  },
  '& td:first-child,& th:first-child': {
    padl: '12px',
  },
  '& td:last-child,& th:last-child': {
    padr: '12px',
  },
});

interface MarkdownDataTableProps extends DataTableProps {
  idx: number;
}

const MarkdownDataTable: React.FC<MarkdownDataTableProps> = ({idx, ...dataTableProps}) => {
  const {ast, props} = useContext(context);
  const node = ast.nodes[idx];
  const head = dataTableProps.data[0];
  const columnCount = head.length;
  const tableClassName = columnCount > 5 ? (columnCount > 8 ? tableExtraCompactClass : tableCompactClass) : '';

  const element = (
    <MarkdownBlock idx={idx} className={tableClassName}>
      <DataTable {...dataTableProps} />
    </MarkdownBlock>
  );

  const doCenterAsTopLevelBlock = props.isFullWidth && isFirstLevelBlockElement(node, ast);
  return doCenterAsTopLevelBlock ? (
    <MarkdownFullWidthBlock wide={columnCount > 4} xwide={columnCount > 11}>
      {element}
    </MarkdownFullWidthBlock>
  ) : (
    element
  );
};

export default MarkdownDataTable;
