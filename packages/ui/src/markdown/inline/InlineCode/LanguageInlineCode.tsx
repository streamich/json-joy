import * as React from 'react';
import {type Theme, rule, useRule} from 'nano-theme';
import HighlightCode from '../../../1-inline/HighlightCode';

const blockClass = rule({
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
  const dynamicBlockClass = useRule((theme: Theme) => ({
    bg: theme.g(0, 0.03),
    '&:hover': {
      bg: theme.g(0, 0.05),
    },
    '&:active': {
      bg: theme.g(0, 0.08),
    },
  }));

  return (
    <span {...rest} className={className + blockClass + dynamicBlockClass}>
      <HighlightCode code={value} lang={lang} />
    </span>
  );
};

export default LanguageInlineCode;
