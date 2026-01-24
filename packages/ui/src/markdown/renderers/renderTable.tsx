import * as React from 'react';
import type {RenderNode} from '../types';
import isFirstLevelBlockElement from '../util/isFirstLevelBlockElement';
import MarkdownFullWidthBlock from '../util/MarkdownFullWidthBlock';
import {rule} from 'nano-theme';
import MarkdownBlock from '../util/MarkdownBlock';
import {MyTable} from '../block/Csv/MyTable';
import {Paper} from '../../4-card/Paper';

const {createElement: h} = React;

const tableClass = rule({
  '& td,& th': {
    minW: '50px',
  },
  '& td:first-child,& th:first-child': {
    minW: '100px',
  },
});

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

const renderTable: RenderNode = (renderers, ast, idx, props, state) => {
  const node = ast.nodes[idx];
  const align = (node as any).align as (null | string)[];
  const columnCount = align.length;
  if (!node.children) return null;
  const [head, ...body] = node.children;
  const bodyRows = body.map((nodeIdx) => renderers.tableRow(renderers, ast, nodeIdx as any as number, props, state));

  const tableClassName =
    tableClass + (columnCount > 5 ? (columnCount > 8 ? tableExtraCompactClass : tableCompactClass) : '');

  const element = (
    <MarkdownBlock idx={idx}>
      <Paper style={{overflowX: 'scroll'}}>
        <MyTable className={tableClassName}>
          <thead>{renderers.tableRow(renderers, ast, head, props, state)}</thead>
          {h('tbody', {}, ...bodyRows)}
        </MyTable>
      </Paper>
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

export default renderTable;
