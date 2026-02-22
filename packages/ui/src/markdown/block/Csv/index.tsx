import * as React from 'react';
import type {IMarkdownBlockCodeProps} from '../shared';
import MarkdownDataTable from './MarkdownDataTable';
const {parse} = require('papaparse'); // eslint-disable-line @typescript-eslint/no-var-requires

const {memo, useMemo} = React;

const CsvBlock = memo((props: IMarkdownBlockCodeProps) => {
  const {idx, source, renderError} = props;
  const parsed = useMemo(() => parse(source, {}), [source]);

  if (parsed.errors.length) {
    return renderError(props, parsed.errors[0]) as React.ReactElement | null;
  }

  return <MarkdownDataTable idx={idx} data={parsed.data} />;
});

export default CsvBlock;
