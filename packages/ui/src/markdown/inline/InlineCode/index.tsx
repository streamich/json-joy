import * as React from 'react';
import GenericInlineCode from './GenericInlineCode';
import LanguageInlineCode from './LanguageInlineCode';
import {context} from '../../context';
import Key from '../../components/Key';
import {useT} from 'use-t';
import {useToasts} from '../../../7-fullscreen/ToastCardManager/context';
import {lightTheme, drule} from 'nano-theme';
import {useStyles} from '../../../styles/context';

const getBlockquoteClass = drule({
  pad: '0 0 0 12px !important',
  mar: '0 !important',
  trs: 'border 0.2s',
  ...lightTheme.font.mono.mid,
});

const copy = require('clipboard-copy'); // eslint-disable-line

const {useContext} = React;

interface Props {
  idx: number;
}

const InlineCode: React.FC<Props> = ({idx}) => {
  const [t] = useT();
  const toasts = useToasts();
  const {ast} = useContext(context);
  const styles = useStyles();
  const node = ast.nodes[idx] as any;
  let lang = '';
  let value = node.value;
  const hasLanguageSet = node.wrap === '``';

  const blockquoteClass = getBlockquoteClass({
    bdl: `6px solid ${styles.g(0, 0.08)}`,
    '&:hover': {
      bdl: `6px solid ${styles.g(0, 0.16)}`,
    },
  });

  if (hasLanguageSet) {
    const matches = node.value.match(/^([^\s]+)\s+(.+)$/);
    if (matches) {
      lang = matches[1];
      value = matches[2];
    }
  }

  if (lang === 'kbd' || lang === 'key') {
    return <Key>{value}</Key>;
  }

  const handleClick = () => {
    copy(value);
    toasts.add({
      title: t('Copied to clipboard!'),
      message: <blockquote className={blockquoteClass}>{value}</blockquote>,
      duration: 5000,
    });
  };

  if (lang) {
    return <LanguageInlineCode value={value} lang={lang} onClick={handleClick} />;
  }

  return (
    <GenericInlineCode data-lang={lang} onClick={handleClick}>
      {value}
    </GenericInlineCode>
  );
};

export default InlineCode;
