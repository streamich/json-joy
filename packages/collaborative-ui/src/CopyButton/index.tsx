import * as React from 'react';
import {useT} from 'use-t';
import {BasicButton} from 'nice-ui/lib/2-inline-block/BasicButton';
import {Iconista} from 'nice-ui/lib/icons/Iconista';
import {BasicTooltip, type BasicTooltipProps} from 'nice-ui/lib/4-card/BasicTooltip';
import useMountedState from 'react-use/lib/useMountedState';
import {rule, theme} from 'nano-theme';
const copy = require('clipboard-copy'); // eslint-disable-line

const css = {
  text: rule({
    ...theme.font.ui1.mid,
  }),
};

export interface CopyButtonProps {
  onCopy: () => string;
  tooltip?: Partial<BasicTooltipProps>;
}

export const CopyButton: React.FC<CopyButtonProps> = ({onCopy, tooltip}) => {
  const [t] = useT();
  const isMounted = useMountedState();
  const [copied, setCopied] = React.useState(false);

  const handleCopyClick = () => {
    setCopied(true);
    copy(onCopy());
    setTimeout(() => {
      if (isMounted()) setCopied(false);
    }, 2000);
  };

  return (
    <BasicTooltip show={copied} renderTooltip={() => <span className={css.text}>{t('Copied!')}</span>} {...tooltip}>
      <BasicButton compact onClick={handleCopyClick}>
        <Iconista set="atlaskit" icon="copy" width={16} height={16} />
      </BasicButton>
    </BasicTooltip>
  );
};
