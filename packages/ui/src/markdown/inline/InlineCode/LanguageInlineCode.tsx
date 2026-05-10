import * as React from 'react';
import {drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';
import HighlightCode from '../../../1-inline/HighlightCode';

const blockClass = drule({
  d: 'inline-block',
  bdrad: '4px',
  mar: '0 1px !important',
  pad: '0px 0.33em !important',
  trs: 'background .1s',
  cur: 'alias',
  fz: '0.9em',
});

export interface Props extends React.AllHTMLAttributes<any> {
  value: string;
  lang: string;
}

const LanguageInlineCode: React.FC<Props> = ({value, lang, className = '', ...rest}) => {
  const styles = useStyles();
  const cls = blockClass({
    bg: styles.g(0, 0.03),
    '&:hover': {
      bg: styles.g(0, 0.05),
    },
    '&:active': {
      bg: styles.g(0, 0.08),
    },
  });

  return (
    <span {...rest} className={className + cls}>
      <HighlightCode code={value} lang={lang} />
    </span>
  );
};

export default LanguageInlineCode;
